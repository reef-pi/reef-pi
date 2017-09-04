import React from 'react'
import $ from 'jquery'
import {YAxis, XAxis, LineChart, Line} from 'recharts'

export default class TemperatureController extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      tc: {},
      readings: [],
      latest: undefined,
    }
    this.fetchData = this.fetchData.bind(this)
    this.updateMin = this.updateMin.bind(this)
    this.updateMax = this.updateMax.bind(this)
    this.updateCheckInterval = this.updateCheckInterval.bind(this)
    this.updateHeater = this.updateHeater.bind(this)
    this.updateCooler = this.updateCooler.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.updateControl = this.updateControl.bind(this)
    this.showDetails = this.showDetails.bind(this)
    this.update = this.update.bind(this)
    this.showChart = this.showChart.bind(this)
  }

  showChart () {
    if (!this.state.tc.enable) {
      return
    }
    var data = []
    $.each(this.state.readings, function (i, v) {
      data.push({v: v})
    })
    return (
      <div className='container'>
        <div className='row'>
          <span className='h6'>Current temperature: {this.state.latest}</span>
        </div>
        <div className='row'>
          <span className='h6'>Trend </span>
        </div>
        <div className='row'>
          <LineChart width={600} height={300} data={data}>
            <Line type='monotone' dataKey='v' stroke='#8884d8' />
            <YAxis />
            <XAxis />
          </LineChart>
       </div>
     </div>
    )
  }

  updateMin (ev) {
    var tc = this.state.tc
    tc.min = ev.target.value
    this.setState({tc: tc})
  }

  updateMax (ev) {
    var tc = this.state.tc
    tc.max = ev.target.value
    this.setState({tc: tc})
  }

  updateCheckInterval (ev) {
    var tc = this.state.tc
    tc.check_interval = ev.target.value
    this.setState({tc: tc})
  }

  updateHeater (ev) {
    var tc = this.state.tc
    tc.heater = ev.target.value
    this.setState({tc: tc})
  }

  updateCooler (ev) {
    var tc = this.state.tc
    tc.cooler = ev.target.value
    this.setState({tc: tc})
  }

  updateEnable (ev) {
    var tc = this.state.tc
    tc.enable = ev.target.checked
    this.setState({tc: tc})
  }

  updateControl (ev) {
    var tc = this.state.tc
    tc.control = ev.target.checked
    this.setState({tc: tc})
  }

  update () {
    var tc = this.state.tc
    tc.min = parseInt(tc.min)
    tc.max = parseInt(tc.max)
    tc.check_interval = parseInt(tc.check_interval)
    tc.cooler = parseInt(tc.cooler)
    tc.heater = parseInt(tc.heater)

    if (isNaN(tc.min)) {
      window.alert('Minimum threshold has to be a positive integer')
      return
    }
    if (isNaN(tc.max)) {
      window.alert('Maximum threshold has to be a positive integer')
      return
    }
    if (isNaN(tc.heater)) {
      window.alert('Heater pin has to be a positive integer')
      return
    }
    if (isNaN(tc.cooler)) {
      window.alert('cooler pin has to be a positive integer')
      return
    }
    if (isNaN(tc.check_interval)) {
      window.alert('check interval to be a positive integer')
      return
    }

    $.ajax({
      url: '/api/tc/config',
      type: 'POST',
      data: JSON.stringify(tc),
      success: function (data) {
        this.setState({
          tc: tc
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/tc/config',
      type: 'GET',
      success: function (data) {
        this.setState({
          tc: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
    $.ajax({
      url: '/api/tc/readings',
      type: 'GET',
      success: function (data) {
        this.setState({
          readings: data.readings,
          latest: data.latest
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  componentDidMount () {
    this.fetchData()
  }

  showDetails () {
    if (!this.state.tc.control) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'> Minimum Threshold </div>
          <div className='col-sm-2'><input type='text' id='min' value={this.state.tc.min} onChange={this.updateMin} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Maximum Threshold </div>
          <div className='col-sm-2'><input type='text' id='max' value={this.state.tc.max} onChange={this.updateMax} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Heater </div>
          <div className='col-sm-2'><input type='text' id='heater' value={this.state.tc.heater} onChange={this.updateHeater} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Cooler </div>
          <div className='col-sm-2'><input type='text' id='cooler' value={this.state.tc.cooler} onChange={this.updateCooler} /></div>
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'> Enable </div>
          <div className='col-sm-2'><input type='checkbox' id='tc_enable' defaultChecked={this.state.tc.value} onClick={this.updateEnable} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Check Interval (in minutes) </div>
          <div className='col-sm-2'><input type='text' id='check_interval' value={this.state.tc.check_interval} onChange={this.updateCheckInterval} /></div>
        </div>
        <div className='row'>
          <div className='col-sm-3'> Control </div>
          <div className='col-sm-2'><input type='checkbox' id='tc_control' defaultChecked={this.state.tc.control} onClick={this.updateControl} /></div>
        </div>
        <div className='row'>
          {this.showDetails()}
        </div>
        <div className='row'>
          <input value='Update' onClick={this.update} type='button' className='btn btn-outline-danger' />
        </div>
        <div className='row'>
          {this.showChart()}
        </div>
      </div>
    )
  }
}

