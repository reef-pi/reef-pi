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
    this.updateEquipment = this.updateEquipment.bind(this)
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

  updateEquipment (e) {
    $.ajax({
      url: '/api/equipments/' + this.props.id,
      type: 'POST',
      data: JSON.stringify({
        on: this.state.action === 'on',
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

  componentDidMount () {
    this.fetchOutlet()
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'> <label>{this.props.name}</label></div>
          <div className='col-sm-1'><input id={this.props.name} type='button' value={this.state.action} onClick={this.updateEquipment} className='btn btn-outline-primary' /></div>
        </div>
      </div>
    )
  }
}
