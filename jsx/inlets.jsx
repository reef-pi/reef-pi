import React, { Component } from 'react'
import { DropdownButton, MenuItem, Table } from 'react-bootstrap'
import $ from 'jquery'

export default class Inlets extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }
  render () {
    var sliderVisible = {
      display: this.showValueSlider() ? 'block' : 'none'
    }
    return (
      <div className='container' />
    )
  }
}
