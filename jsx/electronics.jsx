import React, { Component } from 'react'

import Outlets from './outlets.jsx'
import Boards from './boards.jsx'

export default class Electronics extends React.Component {
  constructor (props) {
    super(props)
  }
  onChange () {
  }

  render () {
    return (
      <div>
        <h4>Boards</h4>
        <Boards />
        <hr />
        <h4>Outlets</h4>
        <Outlets />
      </div>
    )
  }
}
