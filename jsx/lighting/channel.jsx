import React from 'react'
import { HuePicker } from 'react-color'
import Profile from 'lighting/profile'
import PropTypes from 'prop-types'

export default class Channel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      channel: this.props.config,
      colorPicked: false,
      expand: false
    }
    this.updateReverse = this.updateReverse.bind(this)
    this.update = this.update.bind(this)
    this.updateMin = this.updateMin.bind(this)
    this.updateMax = this.updateMax.bind(this)
    this.updateStartMin = this.updateStartMin.bind(this)
    this.updateName = this.updateName.bind(this)
    this.updateColor = this.updateColor.bind(this)
    this.colorPicker = this.colorPicker.bind(this)
    this.toggle = this.toggle.bind(this)
    this.details = this.details.bind(this)
  }

  toggle () {
    this.setState({expand: !this.state.expand})
  }

  colorPicker () {
    if (!this.state.colorPicked) {
      return (
        <button
          disabled={this.props.readOnly}
          onClick={() => this.setState({colorPicked: true})}
          style={{backgroundColor: this.state.channel.color}}
          className='btn btn-secondary'
        />
      )
    }
    return (
      <HuePicker color={this.state.channel.color} onChangeComplete={this.updateColor} />
    )
  }

  updateMin (ev) {
    this.update('min', ev.target.value)
  }

  updateColor (color) {
    var ch = this.state.channel
    ch.color = color.hex
    this.setState({
      channel: ch,
      colorPicked: false
    })
    this.props.hook(ch)
  }

  updateName (ev) {
    this.update('name', ev.target.value)
  }

  updateStartMin (ev) {
    this.update('start_min', ev.target.value)
  }

  updateMax (ev) {
    this.update('max', ev.target.value)
  }

  update (k, v) {
    var ch = this.state.channel
    ch[k] = v
    this.setState({
      channel: ch
    })
    this.props.hook(ch)
  }

  updateReverse (ev) {
    this.update('reverse', ev.target.checked)
  }

  details () {
    return (
      <div className='container border-light'>
        <div className='form-inline row'>
          <div className='form-group col-lg-2'>
            <label>Reverse</label>
            <input
              disabled={this.props.readOnly}
              type='checkbox'
              onClick={this.updateReverse}
              defaultChecked={this.state.channel.reverse}
              className='form-control'
            />
          </div>
          <div className='form-group col-lg-2'>
            <label>Color</label>
            {this.colorPicker()}
          </div>
          <div className='form-group col-lg-2'>
            <label>Min</label>
            <input
              type='text'
              onChange={this.updateMin}
              value={this.state.channel.min}
              className='form-control col-lg-6'
              disabled={this.props.readOnly}
            />
          </div>
          <div className='form-group col-lg-2'>
            <label>Max</label>
            <input
              className='form-control col-lg-6'
              type='text'
              onChange={this.updateMax}
              value={this.state.channel.max}
              disabled={this.props.readOnly}
            />
          </div>
          <div className='form-group col-lg-2'>
            <label>Start</label>
            <input
              className='form-control col-lg-6'
              type='text'
              onChange={this.updateStartMin}
              value={this.state.channel.start_min}
              disabled={this.props.readOnly}
            />
          </div>
        </div>
        <div className='row'>
          <Profile
            config={this.state.channel.profile.config}
            type={this.state.channel.profile.type}
            hook={(v) => this.update('profile', v)}
            name={'profile-' + this.props.light_id + '-' + this.state.channel.pin}
            readOnly={this.props.readOnly}
          />
        </div>
      </div>
    )
  }

  render () {
    var d = <div />
    var lbl = '+'
    if (this.state.expand) {
      d = this.details()
      lbl = '-'
    }
    return (
      <div className='container border-light rounded'>
        <div className='form-inline'>
          <div className='form-group'>
            <input
              type='text'
              value={this.state.channel.name}
              onChange={this.updateName}
              className='form-control'
              disabled={this.props.readOnly}
            />
            <span className='badge'>({this.state.channel.pin})</span>
          </div>
          <input
            type='button'
            value={lbl}
            className='btn btn-secondary'
            onClick={this.toggle}
            id={'expand-channel-' + this.props.light_id + '-' + this.state.channel.pin}
          />
        </div>
        {d}
      </div>
    )
  }
}

Profile.propTypes = {
  light_id: PropTypes.string,
  hook: PropTypes.func,
  config: PropTypes.object,
  readOnly: PropTypes.bool
}
