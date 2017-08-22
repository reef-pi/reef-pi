import React from 'react'

export default class LightSlider extends React.Component {

  constructor (props) {
    super(props)
    this.update = this.update.bind(this)
  }

  update (ev) {
    var value = this.props.getValue()
    value = parseInt(ev.target.value)
    this.props.onChange(this.props.pin, value)
  }

  render () {
    var value = this.props.getValue()
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>{this.props.name}</div>
        </div>
        <div className='row'>
          <div className='row'>{value}</div>
          <div className='row'>
            <input className='col-sm-6' type='range' onChange={this.update} value={value} id={'intensity-' + this.props.name} />
          </div>
        </div>
      </div>
    )
  }
}
