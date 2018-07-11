import React from 'react'

export default class Slider extends React.Component {
  constructor (props) {
    super(props)
    this.update = this.update.bind(this)
  }

  update (ev) {
    var value = this.props.getValue()
    value = parseInt(ev.target.value)
    this.props.onChange(value)
  }

  render () {
    var value = this.props.getValue()
    return (
      <div className='container'>
        <div className='col-lg-1 col-xs-1'>{value}</div>
        <input className='col-lg-9 col-xs-9' type='range' onChange={this.update} value={value} id={'intensity-' + this.props.name} />
      </div>
    )
  }
}
