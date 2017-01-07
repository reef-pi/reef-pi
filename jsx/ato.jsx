import React from 'react'
import $ from 'jquery'

export default class ATO extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ato_configs: [],
      addATO: false,
      new_ato_config: {}
    }
    this.addATO = this.addATO.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.listATOConfigs = this.listATOConfigs.bind(this)
    this.removeATO = this.removeATO.bind(this)
    this.toggleAddATODiv = this.toggleAddATODiv.bind(this)
    this.configureATO = this.configureATO.bind(this)
  }

  fetchData () {
    $.ajax({
      url: '/api/ato_configs',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          ato_configs: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  addATO () {
    var payload = {
      name: $('#ato-name').val(),
      sensor_pin: Number($('#sensor-pin').val()),
      pump_pin: Number($('#pump-pin').val()),
      frequency: Number($('#frequency').val())
    }
    payload['high_relay'] = $('#high-relay').checked
    $.ajax({
      url: '/api/ato_configs',
      type: 'PUT',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.toggleAddATODiv()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  toggleAddATODiv () {
    this.setState({
      addATO: !this.state.addATO
    })
    $('#outlet-name').val('')
  }

  removeATO (ev) {
    var atoID = ev.target.id.split('-')[1]
    $.ajax({
      url: '/api/ato_configs/' + atoID,
      type: 'DELETE',
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  configureATO (ev) {
    var atoID = ev.target.id.split('-')[2]
    $.ajax({
      url: '/api/ato/' + atoID + '/' + ev.target.value,
      type: 'POST',
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  listATOConfigs () {
    var rows = []
    $.each(this.state.ato_configs, function (k, v) {
      rows.push(
        <li className='list-group-item row' key={v.id}>
          <div className='col-sm-7'>{v.name} </div>
          <div className='col-sm-1'><input id={'ato-action-' + v.id} type='button' value={v.enabled ? 'stop' : 'start'} onClick={this.configureATO} className='btn btn-outline-danger' /> </div>
          <div className='col-sm-1'><input id={'ato-' + v.id} type='button' value='delete' onClick={this.removeATO} className='btn btn-outline-danger' /> </div>
        </li>
        )
    }.bind(this))
    return rows
  }

  render () {
    var dStyle = {
      display: this.state.addATO ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <ul className='list-group'>
          {this.listATOConfigs()}
        </ul>
        <input className='btn btn-outline-success' type='button' value={this.state.addATO ? '-' : '+'} onClick={this.toggleAddATODiv} />
        <div className='container' style={dStyle}>
          <div className='row'>
            <div className='col-sm-2'>Name</div>
            <input type='text' id='ato-name' className='col-sm-2' />
            <label className='col-sm-2' ><input className='checkbox' type='checkbox' id='high-relay' /> High Relay</label>
          </div>
          <div className='row'>
            <div className='col-sm-3'>Check Frequency (in seconds)</div>
            <input type='text' id='frequency' className='col-sm-1' />
          </div>
          <div className='row'>
            <div className='col-sm-2'>Float switch</div>
            <input type='text' id='sensor-pin' className='col-sm-2' />
          </div>
          <div className='row'>
            <div className='col-sm-2'>Pump</div>
            <input type='text' id='pump-pin' className='col-sm-2' />
          </div>
          <div className='row'>
            <input type='button' value='add' onClick={this.addATO} className='btn btn-outline-primary' />
          </div>
        </div>
      </div>
    )
  }
}
