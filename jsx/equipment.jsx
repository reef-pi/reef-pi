import React from 'react'
import $ from 'jquery'

export default class Equipment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      outlet: {},
      action: (props.on ? 'off' : 'on'),
      value: this.props.value
    }
    this.updateEquipmentAction = this.updateEquipmentAction.bind(this)
    this.updateEquipmentValue = this.updateEquipmentValue.bind(this)
    this.fetchOutlet = this.fetchOutlet.bind(this)
  }

  fetchOutlet () {
    $.ajax({
      url: '/api/outlets/' + this.props.outlet,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          outlet: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  updateEquipmentAction (e) {
    $.ajax({
      url: '/api/equipments/' + this.props.name,
      type: 'POST',
      data: JSON.stringify({
        on: this.state.action === 'on',
        value: Number(this.state.value),
        name: this.props.name,
        outlet: this.props.outlet
      }),
      success: function (data) {
        this.setState({
          action: this.state.action === 'on' ? 'off' : 'on'
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  updateEquipmentValue (e) {
    this.setState({
      value: parseInt(e.target.value)
    })
    $.ajax({
      url: '/api/equipments/' + this.props.name,
      type: 'POST',
      data: JSON.stringify({
        on: true,
        value: Number(this.state.value),
        name: this.props.name,
        outlet: this.props.outlet
      }),
      success: function (data) {
        this.setState({
          action: 'off'
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  componentDidMount () {
    this.fetchOutlet()
  }

  render () {
    var displayStyle = {}

    if (this.state.outlet.type !== 'pwm') {
      displayStyle['display'] = 'none'
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'> <label>{this.props.name}</label></div>
          <div className='col-sm-8'>
            <input id={this.props.name}
              className='container'
              type='range'
              style={displayStyle}
              onChange={this.updateEquipmentValue}
              onClick={this.updateEquipmentValue}
              value={this.state.value} />
          </div>
          <div className='col-sm-1'><label style={displayStyle}>{this.state.value}</label></div>
          <div className='col-sm-1'><input type='button' value={this.state.action} onClick={this.updateEquipmentAction} className='btn btn-outline-primary' /></div>
        </div>
      </div>
    )
  }
}
