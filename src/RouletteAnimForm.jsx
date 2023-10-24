import BezierEasingEditor from "bezier-easing-editor";
import PropTypes from "prop-types";

RouletteAnimForm.propTypes = {
  children: PropTypes.string,
  radioGroupName: PropTypes.string,
  defaultRouletteProp: PropTypes.shape({
    duration: PropTypes.number,
    rotationCount: PropTypes.number,
    name: PropTypes.string,
  }),
  handleChangeRotationCount: PropTypes.func,
  handleChangeDuration: PropTypes.func,
  handleChangeEasingFunc: PropTypes.func,
  easingFunc: PropTypes.arrayOf(PropTypes.number),
  easingType: PropTypes.string,
}

function RouletteAnimForm ({ children, radioGroupName, defaultRouletteProp, easingType, easingFunc,
                             handleChangeDuration, handleChangeRotationCount, handleChangeEasingFunc }) {
  const handleChangeInput = (e) => {
    handleChangeEasingFunc(e.target.value, easingFunc)
  }

  return (
          <div>
            <div>{children}</div>
            <label>
              <input type="radio" name={radioGroupName} value="linear" defaultChecked={easingType === 'linear'} onChange={handleChangeInput}/>
              linear
            </label>
            <label>
              <input type="radio" name={radioGroupName} value="custom" defaultChecked={easingType === 'custom'} onChange={handleChangeInput}/>
              custom
            </label>
            <div>
              <span>duration(ms)</span>
              <input type="number" defaultValue={defaultRouletteProp.duration} onChange={e => handleChangeDuration(e.target.value)}/>
            </div>
            <div>
              <span>rotationCount</span>
              <input type="number" defaultValue={defaultRouletteProp.rotationCount} onChange={e => handleChangeRotationCount(e.target.value)}/>
            </div>
            {
              (easingType === 'custom') && <div>
              <BezierEasingEditor defaultValue={easingFunc} onChange={(newValue) => {
                const func = newValue.map(v => Number(v.toFixed(2)))
                handleChangeEasingFunc(easingType, func)
              }}/>
              <blockquote>{easingFunc.join(', ')}</blockquote>
            </div>}
          </div>
  )
}

export default RouletteAnimForm
