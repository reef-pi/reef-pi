import React from 'react'
import PropTypes from 'prop-types'

export default class Driver extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    return (
      <div className='row'>
        <div className='col'>{this.props.name}</div>
        <div className='col'>
          <label className='small'>{this.props.type}</label>
        </div>
      </div>
    )
  }
}

Driver.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  config: PropTypes.object
}
