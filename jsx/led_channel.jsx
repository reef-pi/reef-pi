import React from 'react'

export default class LEDChannel extends React.Component {
  constructor (props) {
    super(props)
    this.sliderList = this.sliderList.bind(this)
    this.curry = this.curry.bind(this)
  }

  curry (i) {
    return (
      function (ev) {
        var values = this.props.getValues()
        values[i] = parseInt(ev.target.value)
        this.props.onChange(values)
      }.bind(this)
    )
  }

  sliderList () {
    var values = this.props.getValues()
    if(values===undefined){
			values = Array(12).fill(10)
    }

    var rangeStyle = {
      WebkitAppearance: 'slider-vertical'
    }
    var list = []
    for (var i = 0; i < 12; i++) {
      list.push(
        <div className='col-sm-1 text-center' key={i + 1}>
          <div className='row'>{values[i]}</div>
          <div className='row'>
            <input className='col-xs-1' type='range' style={rangeStyle} onChange={this.curry(i)} value={values[i]} id={'intensity-' + i} />
          </div>
          <div className='row'>
            <label>{i * 2}</label>
          </div>
        </div>
      )
    }
    return (list)
  }
  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>{this.props.name}</div>
        </div>
        <div className='row'>
          {this.sliderList()}
        </div>
      </div>
    )
  }
}
