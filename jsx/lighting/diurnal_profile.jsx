import React from 'react'
import PropTypes from 'prop-types'

export default class DiurnalProfile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      start: props.config.start,
      end: props.config.end,
      min: props.config.min,
      max: props.config.max
    }
    this.updateText = this.updateText.bind(this)
    this.updateInt = this.updateInt.bind(this)
  }

  updateText (k) {
    return (ev) => {
      var c = this.props.config
      c[k] = ev.target.value
      this.props.hook(c)
    }
  }

  updateInt (k) {
    return (ev) => {
      var c = this.props.config
      c[k] = parseInt(ev.target.value)
      this.props.hook(c)
    }
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-lg-2 form-group'>
            <label>Start</label>
            <input
              type='text'
              className='form-control'
              onChange={this.updateText('start')}
              value={this.state.start}
            />
          </div>
          <div className='col-lg-2 form-group'>
            <label>End</label>
            <input
              type='text'
              className='form-control'
              onChange={this.updateText('end')}
              value={this.state.end}
            />
          </div>
          <div className='col-lg-2 form-group'>
            <label>Min</label>
            <input
              type='text'
              className='form-control'
              onChange={this.updateInt('min')}
              value={this.state.min}
            />
          </div>
          <div className='col-lg-2 form-group'>
            <label>Max</label>
            <input
              className='form-control'
              type='text'
              onChange={this.updateInt('max')}
              value={this.state.max}
            />
          </div>
        </div>
      </div>
    )
  }
}

DiurnalProfile.propTypes = {
  config: PropTypes.object,
  hook: PropTypes.func,
  readOnly: PropTypes.bool
}
