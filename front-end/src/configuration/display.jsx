import React from 'react'
import { fetchDisplay, switchDisplay, setBrightness } from '../redux/actions/display'
import { connect } from 'react-redux'
import i18n from 'utils/i18n'

class display extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      brightness: props.config ? props.config.brightness : 100,
      on: props.config ? props.config.on : undefined
    }
    this.handleToggle = this.handleToggle.bind(this)
    this.handleSetBrightness = this.handleSetBrightness.bind(this)
  }

  static getDerivedStateFromProps (props, state) {
    if (props.config === undefined || props.config === null) {
      return null
    }
    if (Object.keys(props.config).length === 0) {
      return null
    }
    state.on = props.config.on
    state.brightness = props.config.brightness
    return state
  }

  componentDidMount () {
    this.props.fetchDisplay()
  }

  handleToggle () {
    this.props.switchDisplay(this.state.on)
    this.setState({ on: !this.state.on })
    this.props.fetchDisplay()
  }

  handleSetBrightness (ev) {
    const b = parseInt(ev.target.value)
    this.props.setBrightness(b)
    this.setState({ brightness: b })
  }

  render () {
    let style = 'btn btn-outline-success'
    let action = i18n.t('on')
    if (this.state.on) {
      style = 'btn btn-outline-danger'
      action = i18n.t('off')
    }
    return (
      <div className='container'>
        <div className='col-sm-1'>
          <button onClick={this.handleToggle} type='button' className={style}>
            {' '}
            {action}{' '}
          </button>{' '}
        </div>
        <div className='col-sm-2'>{i18n.t('configuration:settings:brightness')}</div>
        <div className='col-sm-6'>
          <input
            type='range'
            onChange={this.handleSetBrightness}
            style={{ width: '100%' }}
            min={0}
            max={255}
            value={this.state.brightness}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    config: state.display
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDisplay: () => dispatch(fetchDisplay()),
    switchDisplay: () => dispatch(switchDisplay()),
    setBrightness: s => dispatch(setBrightness(s))
  }
}

const Display = connect(
  mapStateToProps,
  mapDispatchToProps
)(display)
export default Display
