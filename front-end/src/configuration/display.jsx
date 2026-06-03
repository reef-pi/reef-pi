import React from 'react'
import { fetchDisplay, switchDisplay, setBrightness } from '../redux/actions/display'
import { connect } from 'react-redux'
import { showUpdateSuccessful } from 'utils/alert'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

export class RawDisplay extends React.Component {
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
    return {
      ...state,
      on: props.config.on,
      brightness: props.config.brightness
    }
  }

  componentDidMount () {
    this.props.fetchDisplay()
  }

  handleToggle () {
    this.props.switchDisplay(this.state.on)
    this.setState({ on: !this.state.on })
    this.props.fetchDisplay()
    showUpdateSuccessful()
  }

  handleSetBrightness (ev) {
    const b = parseInt(ev.target.value)
    this.props.setBrightness(b)
    this.setState({ brightness: b })
  }

  render () {
    const variant = this.state.on ? 'danger' : 'primary'
    const action = this.state.on ? i18n.t('off') : i18n.t('on')
    return (
      <div className='reefpi-view'>
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', alignItems: 'center' }}>
          <Button variant={variant} onClick={this.handleToggle} type='button'>
            {action}
          </Button>
          <span>{i18n.t('configuration:settings:brightness')}</span>
          <input
            type='range'
            onChange={this.handleSetBrightness}
            style={{ flex: 1 }}
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
)(RawDisplay)
export default Display
