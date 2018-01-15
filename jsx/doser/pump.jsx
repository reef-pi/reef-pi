import Common from '../common.jsx'
import $ from 'jquery'
import React from 'react'

export default class Pump extends Common {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return(
     <div className='container'>
      {this.props.data.name}
     </div>
    )
  }
}
