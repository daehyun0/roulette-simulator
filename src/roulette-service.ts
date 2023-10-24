export default class RouletteService {
  drawRouletteWheel(target: HTMLCanvasElement, titles: string[], colors: string[], radius: number) {
    const itemCount = titles.length ?? 0
    const arc = Math.PI * 2 / itemCount
    let ctx

    const scaleFactor = window?.devicePixelRatio ?? 1
    const width = target.clientWidth * scaleFactor
    const offsetAngle = Math.PI / 2 * -1 + Math.PI / itemCount * -1

    const canvas: HTMLCanvasElement = target as HTMLCanvasElement
    canvas.width = width
    canvas.height = width

    if (canvas.getContext) {
      const textDistanceFromCenter = radius * 0.7 * scaleFactor
      ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      ctx.clearRect(0, 0, width, width)
      ctx.strokeStyle = 'gray'
      ctx.lineWidth = 1
      for (let i = 0; i < itemCount; i++) {
        const startAngle = offsetAngle + i * arc
        const endAngle = startAngle + arc
        ctx.fillStyle = colors[i]
        ctx.beginPath()
        const centerX = width / 2
        const centerY = width / 2
        ctx.arc(centerX, centerY, radius * scaleFactor, startAngle, endAngle, false)
        ctx.lineTo(width / 2, width / 2)
        ctx.closePath()
        ctx.fill()
        ctx.save()
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        ctx.shadowBlur = 20
        ctx.shadowColor = 'black'
        ctx.fillStyle = 'white'
        ctx.translate(centerX + Math.cos(startAngle + arc / 2) * textDistanceFromCenter,
          centerY + Math.sin(startAngle + arc / 2) * textDistanceFromCenter)
        ctx.rotate(startAngle + arc / 2 + Math.PI / 2)
        ctx.scale(scaleFactor, scaleFactor)
        const text = titles[i]
        const texts = this.stringSplit(ctx, text, radius, arc)
        ctx.font = 'bold 14px sans-serif'
        this.printText(ctx, texts, 17)
        ctx.restore()
      }
    }
  }

  printText(ctx: CanvasRenderingContext2D, lines: string[], lineHeight: number) {
    for (let i = 0; i < lines.length; i++)
      ctx.fillText(lines[i], -ctx.measureText(lines[i]).width / 2, (i * lineHeight))
  }

  //stringSplitInBox(ctx: CanvasRenderingContext2D, text: string, r: number, padding = 5) {
  // todo: 각도가 90도 이상일때 문자열 개행 방식을 박스형식으로 변경
  //}
  stringSplit(ctx: CanvasRenderingContext2D, text: string, r: number, theta: number, padding = 5) {
    const line = text.split('\n')
    const newLine: string[] = []

    line.forEach((l, i) => {
      const tmatrix = ctx.measureText(l)
      const width = tmatrix.width // text width
      const lineHeight = tmatrix.fontBoundingBoxAscent + tmatrix.fontBoundingBoxDescent
      const c = this.c(r, lineHeight * i, theta) - padding // 부채꼴의 현의 길이
      let debug = 0
      if (width < c) { // 부채꼴의 현의 길이가 text width 보다 크면
        newLine.push(l)
      } else { // 부채꼴의 현의 길이가 text width 보다 작으면
        let startIndex = 0
        let j = 0
        do {
          // console.log('first', startIndex, l.length, l)
          if (startIndex > l.length - 1) {
            break
          }
          let searchIndex = Infinity

          do {
            const lastBlankIndex = l.lastIndexOf(' ', searchIndex)
            if (lastBlankIndex === -1 || lastBlankIndex <= startIndex) {
              newLine.push(l.substring(startIndex))
              startIndex = Infinity
              break
            }
            const subLine = l.substring(startIndex, lastBlankIndex)
            const subWidth = ctx.measureText(subLine).width
            const subC = this.c(r, lineHeight * (i + j), theta) - padding
            // console.log('2', subWidth, subC, subLine, j, lineHeight)
            if (subWidth < subC) {
              newLine.push(subLine)
              j++
              startIndex = lastBlankIndex + 1
              break
            } else {
              searchIndex = lastBlankIndex - 1
            }
            debug++
          } while (debug < 20)
          debug++
        } while (debug < 20)
      }
    })
    return newLine
  }

  c(r: number, lineHeight: number, theta: number) {
    return 2 * (r - (lineHeight / Math.cos(theta / 2))) * Math.sin(theta / 2)
  }
}
