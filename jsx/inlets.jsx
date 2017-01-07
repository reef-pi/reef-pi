import React from 'react'
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
