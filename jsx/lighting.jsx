import React from 'react'
import $ from 'jquery'

export default class Lighting extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addLighting: false,
      lightings: [],
      new_lighting: {
        intensities: Array(12).fill(0)
      }
    }
    this.fetchData = this.fetchData.bind(this)
    this.sliderList = this.sliderList.bind(this)
    this.updateIntensity = this.updateIntensity.bind(this)
    this.toggleAddLightingdDiv = this.toggleAddLightingdDiv.bind(this)
    this.lightingList = this.lightingList.bind(this)
    this.configureLighting = this.configureLighting.bind(this)
    this.deleteLighting = this.deleteLighting.bind(this)
    this.addLighting = this.addLighting.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  deleteLighting (ev) {
    var lightID = ev.target.id.split('-')[1]
    $.ajax({
      url: '/api/lightings/' + lightID,
      type: 'DELETE',
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  configureLighting (ev) {
    var lightID = ev.target.id.split('-')[1]
    var action = ev.target.value
    $.ajax({
      url: '/api/lightings/' + lightID + '/' + action,
      type: 'POST',
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  toggleAddLightingdDiv () {
    this.setState({
      addLighting: !this.state.addLighting
    })
  }

  addLighting () {
    var enabled = $('#lightEnable').checked
    $.ajax({
      url: '/api/lightings',
      type: 'PUT',
      data: JSON.stringify({
        name: $('#lightName').val(),
        enabled: enabled,
        channel: Number($('#lightChannel').val()),
        intensities: this.state.new_lighting.intensities
      }),
      success: function (data) {
        this.fetchData()
        this.toggleAddLightingdDiv()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/lightings',
      type: 'GET',
      success: function (data) {
        this.setState({
          lightings: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
      }
    })
  }

  updateIntensity (e) {
    var new_lighting = this.state.new_lighting
    var i = Number(e.target.id.split('-')[1])
    new_lighting.intensities[i] = Number(e.target.value)
    this.setState({
      new_lighting: new_lighting
    })
  }

  lightingList () {
    var list = []
    $.each(this.state.lightings, function (k, v) {
      var action = ''
      if (v.enabled) {
        action = 'disable'
      } else {
        action = 'enable'
      }
      list.push(
        <li key={k} className='list-group-item row'>
          <div className='col-sm-5'>
            {v.name}
          </div>
          <input type='button' value={action} id={'l_configure-' + v.id} onClick={this.configureLighting} className='col-sm-1 btn btn-outline-primary' />
          <div className='col-sm-1' />
          <input type='button' value='delete' id={'l_delete-' + v.id} onClick={this.deleteLighting} className='col-sm-1 btn btn-outline-danger' />
        </li>
        )
    }.bind(this))
    return list
  }

  sliderList () {
    var rangeStyle = {
      WebkitAppearance: 'slider-vertical'
    }
    var list = []
    for (var i = 0; i < 12; i++) {
      var intensity = this.state.new_lighting.intensities[i]
      list.push(
        <div className='col-sm-1 text-center' key={i + 1}>
          <div className='row'>{intensity}</div>
          <div className='row'>
            <input className='col-xs-1' type='range' style={rangeStyle} onChange={this.updateIntensity} value={intensity} id={'intensity-' + i} />
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
    var dStyle = {
      display: this.state.addLighting ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <ul className='list-group'>
          { this.lightingList() }
        </ul>
        <input type='button' value={this.state.addLighting ? '-' : '+'} onClick={this.toggleAddLightingdDiv} className='btn btn-outline-success' />
        <div style={dStyle} className='container'>
          <div className='row'>
            <div className='col-sm-1'>Name</div>
            <input className='col-sm-2' type='text' id='lightName' />
            <div className='col-sm-1'>Enable</div>
            <input className='col-xs-1 checkbox' type='checkbox' id='lightEnable' />
            <div className='col-sm-1'>Channel</div>
            <input className='col-xs-1' type='text' id='lightChannel' />
          </div>
          <div className='row'>
            {this.sliderList()}
          </div>
          <div className='row'>
            <input type='button' value='add' onClick={this.addLighting} className='btn btn-outline-primary' />
          </div>
        </div>
      </div>
    )
  }
}
