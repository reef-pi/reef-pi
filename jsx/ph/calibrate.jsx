import React from 'react'

export default class Calibrate extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      type: 'high',
      value: 10
    }
    this.calibrate = this.calibrate.bind(this)
    this.setType = this.setType.bind(this)
    this.updateValue = this.updateValue.bind(this)
  }

  setType (k) {
    return () => this.setState({type: k})
  }

  updateValue (ev) {
    this.setState({
      value: ev.target.value
    })
  }

  calibrate () {
    var payload = {
      type: this.state.type,
      value: parseFloat(this.state.value)
    }
    this.props.hook(this.props.probe, payload)
  }

  render () {
    var menuItems = [
      <a className='dropdown-item' key='high' onClick={this.setType('high')}>High</a>,
      <a className='dropdown-item' key='mid' onClick={this.setType('mid')}>Mid</a>,
      <a className='dropdown-item' onClick={this.setType('low')} key='low'>Low</a>
    ]
    return (
      <div className='row'>
        <div className='col-lg-2' />
        <div className='col-lg-1'>Type</div>
        <div className='col-lg-1'>
          <div className='dropdown'>
            <button className='btn btn-secondary dropdown-toggle' type='button' id={this.props.probe + '-calibration-type'} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
              {this.state.type}
            </button>
            <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
              {menuItems}
            </div>
          </div>
        </div>
        <div className='col-lg-1' />
        <div className='col-lg-1'>Value</div>
        <div className='col-lg-1'>
          <input type='text' className='form-control' value={this.state.value} onChange={this.updateValue} />
        </div>
        <div className='col-lg-1'>
          <button className='btn btn-primary' onClick={this.calibrate}>Run</button>
        </div>
      </div>
    )
  }
}
