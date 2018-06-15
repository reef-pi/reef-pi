import React from 'react'
import PropTypes from 'prop-types'
import $ from 'jquery'

export default class Motion extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
	  return (
      <div className='container'>
        <img
          width={this.props.width} height={this.props.height}
          src={this.props.url}
        />
     </div>
    )
  }
}

Motion.propTypes = {
  url: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
}
