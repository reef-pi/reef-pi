import React from 'react'

export default class Notify extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: props.data
    }
    this.enable = this.enable.bind(this)
    this.min = this.min.bind(this)
    this.max = this.max.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.update = this.update.bind(this)
  }

  updateEnable(ev) {
    var data  = this.state.data
    data.enable = !data.enable
    this.setState({data: data})
    this.props.hook(data)
  }

  update(k){
    return(
      function(ev){
        var h =  this.state.data
        h[k] = ev.target.value
        this.setState({data: h})
        this.props.hook(h)
      }.bind(this)
    )
  }

  enable() {
    return(
     <div className='form-check'>
      <label className='form-check-label'>
        <input
          className='form-check-input'
          type='checkbox'
          defaultChecked={this.state.data.enable}
          disabled={this.props.readOnly}
          onClick={this.updateEnable} />
        <b>Enable alerting</b>
      </label>
    </div>
    )
  }

  min() {
    if(!this.state.data.enable) {
     return
    }
    return(
      <div className='input-group'>
        <label className='input-group-addon'>Min</label>
        <input
          type='text'
          readOnly={this.props.readOnly}
          className='form-control'
          value={this.state.data.min}
          onChange={this.update('min')} />
      </div>
    )
  }

  max() {
    if(!this.state.data.enable) {
     return
    }
    return(
      <div className='input-group'>
        <label className='input-group-addon'>Max</label>
        <input
          readOnly={this.props.readOnly}
          type='text'
          className='form-control'
          value={this.state.data.max}
          onChange={this.update('max')} />
      </div>
    )
  }

  render() {
    return(
      <div className='container'>
         {this.enable()}
         {this.min()}
         {this.max()}
      </div>
    )
  }
}
