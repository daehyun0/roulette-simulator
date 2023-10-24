import {useEffect, useRef, useState} from 'react'
import './App.css'
import RouletteService from "./roulette-service.ts";
import anime from "animejs";
import RouletteAnimForm from "./RouletteAnimForm.jsx";

function App() {
  const rewards = [
    {title: '1', backgroundColor: '#F43E31'},
    {title: '2', backgroundColor: '#FC4478'},
    {title: '3', backgroundColor: '#9C27B0'},
    {title: '4', backgroundColor: '#673AB7'},
    {title: '5', backgroundColor: '#3F51B5'},
    {title: '6', backgroundColor: '#2196F3'}
  ]
  const isWheelSpinning = useRef(false)
  const playPromise = useRef(null)
  const animPropList = [
    {title: 'API 응답 전', name: 'before-res-api'},
    {title: '룰렛 종료', name: 'end'}
  ]
  const animList = useRef([])
  const wheelRef = useRef(null)
  const [rouletteProps, setRouletteProps] = useState([
    {name: 'before-res-api', duration: 200, rotationCount: 1, easingType: 'linear', easingFunc: [0.25, 0.25, 0.75, 0.75]},
    {name: 'end', duration: 8000, rotationCount: 10, easingType: 'custom', easingFunc: [0.090, 0.450, 0.185, 1.009]}
  ])
  const [resultIdx, setResultIdx] = useState(-1)
  const playTimeoutRef = useRef(null)

  const renderRouletteWheel = () => {
    const titles = rewards.map((reward) => reward.title)
    const colors = rewards.map((reward) => reward.backgroundColor)

    new RouletteService().drawRouletteWheel(wheelRef.current, titles, colors, 138)
  }

  useEffect(() => {
    renderRouletteWheel()
  }, []);

  const playTest = () => {
    return new Promise(resolve => {
      const randomIdx = Math.floor(Math.random() * 6)

      playTimeoutRef.current = setTimeout(() => {
        resolve(randomIdx)
      }, 2000)
    })
  }

  const handleClickStartSpin = () => {
    if (isWheelSpinning.current) {
      return
    }

    isWheelSpinning.current = true
    playPromise.current = playTest()
    wheelAnimation()
  }

  const handleClickStopSpin = () => {
    isWheelSpinning.current = false
    setResultIdx(-1)
    clearTimeout(playTimeoutRef.current)
    animList.current.forEach(anim => {
      anim.pause()
    })
    animList.current = []
    resetSpin()
    playPromise.current = Promise.reject('stop by user')
  }

  const resetSpin = () => {
    wheelRef.current.style.transform = ''
  }

  const addAnim = (animejsOption) => {
    const anim = anime(animejsOption)
    animList.current.push(anim)
    return anim
  }

  const getCubicBezier = (easingFunc) => {
    return `cubicBezier(${easingFunc.join(',')})`
  }

  const wheelAnimation = () => {
    resetSpin()

    const rouletteAnimationBaseOption = {
      targets: wheelRef.current,
      autoplay: false,
      loop: false,
    }
    const animBeforeResult = addAnim({
      ...rouletteAnimationBaseOption,
      easing: rouletteProps[0].easingType === 'linear' ? 'linear' : getCubicBezier(rouletteProps[0].easingFunc),
      duration: rouletteProps[0].duration,
      rotate: rouletteProps[0].rotationCount * 360,
      loop: true,
      autoplay: true
    })
    animBeforeResult.play()

    playPromise.current.then(resultIdx => {
      setResultIdx(resultIdx)
      const degree = getDegree(resultIdx)
      const animLast = addAnim({
        ...rouletteAnimationBaseOption,
        rotate: rouletteProps[1].rotationCount * 360 + degree,
        duration: rouletteProps[1].duration,
        easing: rouletteProps[1].easingType === 'linear' ? 'linear' : getCubicBezier(rouletteProps[1].easingFunc),
      })

      animBeforeResult.pause()
      animLast.play()
    })
  }

  const getDegree = (index) => {
    const rewardsCount = rewards.length
    const rewardCentralAngle = 360 / rewardsCount
    // get random degree in range
    const randomDegreeInArc = Math.min(Math.max(Math.floor(Math.random() * rewardCentralAngle), 1), rewardCentralAngle - 1) // randomDegreeInArc should be from 1 to (rewardCentralAngle - 1)
    const angleOffset = 180 / rewardsCount
    return angleOffset - (index * rewardCentralAngle) - randomDegreeInArc
  }

  const makeHandleChangeDegree = (idx, value) => {
    value = Number(value)
    setRouletteProps(prevState => {
      const newState = [...prevState]
      newState.splice(idx, 1, {...prevState[idx], rotationCount: value})
      return newState
    })
  }

  return (
          <div className="container">
            <canvas key={1} width={800} height={800} className="wheel" ref={wheelRef}></canvas>
            <div className="control">
              {
                animPropList.map((anim, idx) => (
                        <RouletteAnimForm key={anim.name}
                                          handleChangeRotationCount={(value) => makeHandleChangeDegree(idx, value)}
                                          handleChangeDuration={(value) => { rouletteProps[idx].duration = Number(value) }}
                                          handleChangeEasingFunc={(type, value) => {
                                            setRouletteProps(prevState => {
                                              const newState = [...prevState]
                                              newState.splice(idx, 1, {
                                                ...prevState[idx],
                                                easingType: type,
                                                easingFunc: value
                                              })
                                              return newState
                                            })
                                          }}
                                          radioGroupName={anim.name} defaultRouletteProp={rouletteProps[idx]}
                                          easingFunc={rouletteProps[idx].easingFunc}
                                          easingType={rouletteProps[idx].easingType}
                        >
                          {anim.title}
                        </RouletteAnimForm>
                ))
              }

              <button onClick={handleClickStartSpin}>룰렛 시작</button>
              <button onClick={handleClickStopSpin}>룰렛 종료</button>

              {
                resultIdx !== -1 && <div>result: { rewards[resultIdx].title }</div>
              }
            </div>
          </div>
  )
}

export default App
