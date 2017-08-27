import React from 'react'
import LightSlider from './light_slider.jsx'

export default class LEDChannel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      auto: this.props.ch.auto,
      min: this.props.ch.min,
      reverse: this.props.ch.reverse,
      max: this.props.ch.max,
      ticks: this.props.ch.ticks,
      fixed: this.props.ch.fixed,
      values: this.props.ch.values
    }
    this.sliderList = this.sliderList.bind(this)
    this.curry = this.curry.bind(this)
    this.update = this.update.bind(this)
    this.updateAuto = this.updateAuto.bind(this)
    this.updateReverse = this.updateReverse.bind(this)
    this.updateFixedValue = this.updateFixedValue.bind(this)
    this.getFixedValue = this.getFixedValue.bind(this)
  }

  updateAuto (ev) {
    this.setState({
      auto: ev.target.checked
    })
    this.update()
  }

  updateReverse (ev) {
    this.setState({
      reverse: ev.target.checked
    })
    this.update()
  }

  getFixedValue () {
    return this.state.fixed
  }

  updateFixedValue (v) {
    this.setState({
      fixed: v
    })
    this.update()
  }

  update () {
    var channel = {
      name: this.props.name,
      pin: parseInt(this.props.pin),
      reverse: this.state.reverse,
      min: this.state.min,
      max: this.state.max,
      ticks: this.state.ticks,
      fixed: this.state.fixed,
      auto: this.state.auto,
      values: this.props.ch.values
    }
    this.props.updateChannel(channel)
  }

  curry (i) {
    return (
      function (ev) {
        var values = this.state.values
        values[i] = parseInt(ev.target.value)
        this.setState({
          values: values
        })
        this.update()
      }.bind(this)
    )
  }

  sliderList () {
    var values = this.state.values
    var rangeStyle = {
      WebkitAppearance: 'slider-vertical'
    }
    var list = []
    var labels = ['12 am', '2 am', '4 am', '6 am', '8 am', '10 am', '12 pm', '2 pm', '4 pm', '6 pm', '8 pm', '10 pm']

    for (var i = 0; i < 12; i++) {
      list.push(
        <div className='col-sm-1 text-center' key={i + 1}>
          <div className='row'>{values[i]}</div>
          <div className='row'>
            <input className='col-xs-1' type='range' style={rangeStyle} onChange={this.curry(i)} value={values[i]} id={'intensity-' + i} />
          </div>
          <div className='row'>
            <label>{labels[i]}</label>
          </div>
        </div>
      )
    }
    return (list)
  }
  render () {
    var showOnDemandSlider = {
      display: this.state.auto ? 'none' : 'block'
    }
    var show24HourSliders = {
      display: this.state.auto ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>{this.props.name}</div>
        </div>
        <div className='row'>
          Auto<input type='checkbox' onChange={this.updateAuto} defaultChecked={this.state.auto} />
          Reverse<input type='checkbox' onChange={this.updateReverse} defaultChecked={this.state.reverse} />
        </div>
        <div className='row' style={show24HourSliders}>
          {this.sliderList()}
        </div>
        <div className='row' style={showOnDemandSlider}>
          <LightSlider pin={this.props.pin} name={this.props.name} onChange={this.updateFixedValue} getValue={this.getFixedValue} style={showOnDemandSlider} />
        </div>
      </div>
    )
  }
}
