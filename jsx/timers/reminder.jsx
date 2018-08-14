import React from 'react'
import PropTypes from 'prop-types'

export default class Reminder extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      message: props.message,
      title: props.title
    }

    this.update = this.update.bind(this)
  }

  update (k) {
    return (ev) => {
      var h = {
        message: this.state.message,
        title: this.state.title
      }
      h[k] = ev.target.value
      this.setState(h)
      this.props.update(h)
    }
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <label className='col-sm-3'>Title</label>
          <input
            className='col-sm-9'
            type='text'
            onChange={this.update('title')}
            defaultValue={this.state.title}
            disabled={this.props.disabled}
          />
        </div>
        <div className='row'>
          <label className='col-sm-3'>Message</label>
          <textarea
            className='col-sm-9'
            onChange={this.update('message')}
            defaultValue={this.state.message}
            disabled={this.props.disabled}
          />
        </div>
      </div>
    )
  }
}

Reminder.propTypes = {
  update: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  id_prefix: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
}
