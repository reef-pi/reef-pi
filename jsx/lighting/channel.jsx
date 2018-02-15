import React from 'react'
import Slider from './slider.jsx'

export default class Channel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      channel: this.props.ch
    }
    this.sliderList = this.sliderList.bind(this)
    this.curry = this.curry.bind(this)
    this.updateAuto = this.updateAuto.bind(this)
    this.updateReverse = this.updateReverse.bind(this)
    this.updateFixedValue = this.updateFixedValue.bind(this)
    this.getFixedValue = this.getFixedValue.bind(this)
    this.update = this.update.bind(this)
    this.updateMin = this.updateMin.bind(this)
    this.updateMax = this.updateMax.bind(this)
    this.updateStartMin = this.updateStartMin.bind(this)
    this.updateName = this.updateName.bind(this)
  }

  updateMin (ev) {
    this.update('min', ev.target.value)
  }

  updateName (ev) {
    this.update('name', ev.target.value)
  }

  updateStartMin (ev) {
    this.update('start_min', ev.target.value)
  }

  updateMax (ev) {
    this.update('max', ev.target.value)
  }

  update (k, v) {
    var ch = this.state.channel
    ch[k] = v
    this.setState({
      channel: ch
    })
    this.props.updateChannel(ch)
  }

  updateAuto (ev) {
    this.update('auto', ev.target.checked)
  }

  updateReverse (ev) {
    this.update('reverse', ev.target.checked)
  }

  getFixedValue () {
    return this.state.channel.fixed
  }

  updateFixedValue (v) {
    this.update('fixed', v)
  }

  curry (i) {
    return (
      function (ev) {
        var values = this.state.channel.values
        values[i] = parseInt(ev.target.value)
        this.update('values', values)
      }.bind(this)
    )
  }

  sliderList () {
    var values = this.state.channel.values
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
      display: this.state.channel.auto ? 'none' : 'block'
    }
    var show24HourSliders = {
      display: this.state.channel.auto ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <div className='row'>
          Name: <input type='text' value={this.state.channel.name} onChange={this.updateName} />
          Pin: {this.state.channel.pin}
        </div>
        <div className='row'>
          Auto<input type='checkbox' onClick={this.updateAuto} defaultChecked={this.state.channel.auto} id={this.props.name + '-' + this.props.ch.name + '-auto'} />
          Reverse<input type='checkbox' onClick={this.updateReverse} defaultChecked={this.state.channel.reverse} />
          Min<input type='text' onChange={this.updateMin} value={this.state.channel.min} />
          Max<input type='text' onChange={this.updateMax} value={this.state.channel.max} />
          Start<input type='text' onChange={this.updateStartMin} value={this.state.channel.start_min} />
        </div>
        <div className='row' style={show24HourSliders}>
          {this.sliderList()}
        </div>
        <div className='row' style={showOnDemandSlider}>
          <Slider pin={this.props.pin} name={this.props.ch.name} onChange={this.updateFixedValue} getValue={this.getFixedValue} style={showOnDemandSlider} />
        </div>
      </div>
    )
  }
}
