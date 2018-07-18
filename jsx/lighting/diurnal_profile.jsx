import React from 'react'
import PropTypes from 'prop-types'

export default class DiurnalProfile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      start: props.config.start,
      end: props.config.end
    }
    this.update = this.update.bind(this)
  }

  update (k) {
    return (ev) => {
      var c = this.props.config
      c[k] = ev.target.value
      this.setState({start: c.start, end: c.end})
      this.props.hook(c)
    }
  }

  render () {
    return (
      <div className='form-inline row'>
        <div className='form-group col-lg-3'>
          <label>Start</label>
          <input
            type='text'
            readOnly={this.props.readOnly}
            className='form-control col-lg-6'
            onChange={this.update('start')}
            value={this.state.start}
          />
        </div>
        <div className='form-group col-lg-3'>
          <label>End</label>
          <input
            type='text'
            className='form-control col-lg-6'
            onChange={this.update('end')}
            readOnly={this.props.readOnly}
            value={this.state.end}
          />
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
