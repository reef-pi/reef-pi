import React from 'react'
import PropTypes from 'prop-types'
import {confirm} from 'utils/confirm'

export default class Driver extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.remove = this.remove.bind(this)
  }

  remove () {
    const message = (
      <div>
        <p>This action will delete this driver.</p>
      </div>
    )

    confirm('Delete driver', {description: message})
      .then(function () {
        this.props.remove(this.props.driver_id)
      }.bind(this))
  }

  render () {
    return (
      <div className='row'>
        <div className='col'>{this.props.name}</div>
        <div className='col'>
          <label className='small'>{this.props.type}</label>
        </div>
        <div className='col'>
          <input type='button' onClick={this.remove} value='X' className='btn btn-danger' />
        </div>
      </div>
    )
  }
}

Driver.propTypes = {
  driver_id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  config: PropTypes.object,
  remove: PropTypes.func.isRequired
}
