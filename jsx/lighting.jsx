import React from 'react'
import $ from 'jquery'
import LEDChannel from './led_channel.jsx'

export default class Lighting extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      updated: false,
      enabled: false,
      intensities: Array(12).fill(0),
      spectrums: Array(12).fill(0)
    }
    this.fetchData = this.fetchData.bind(this)
    this.updateIntensity = this.updateIntensity.bind(this)
    this.updateSpectrum = this.updateSpectrum.bind(this)
    this.updateLighting = this.updateLighting.bind(this)
    this.getIntensities = this.getIntensities.bind(this)
    this.getSpectrums = this.getSpectrums.bind(this)
    this.toggleLighting = this.toggleLighting.bind(this)
  }

  componentWillMount () {
    this.fetchData()
  }

  fetchData () {
    $.ajax({
      url: '/api/lighting/cycle',
      type: 'GET',
      success: function (data) {
        this.setState({
          intensities: data.intensities,
          spectrums: data.spectrums,
          enabled: data.enabled
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
    })
  }

  getIntensities () {
    return (this.state.intensities)
  }

  getSpectrums () {
    return (this.state.spectrums)
  }

  updateIntensity (values) {
    this.setState({
      intensities: values,
      updated: true
    })
  }

  updateSpectrum (values) {
    this.setState({
      spectrums: values,
      updated: true
    })
  }

  updateLighting () {
    $.ajax({
      url: '/api/lighting/cycle',
      type: 'POST',
      data: JSON.stringify({
        intensities: this.state.intensities,
        spectrums: this.state.spectrums,
        enabled: this.state.enabled
      }),
      success: function (data) {
        this.setState({
          updated: false
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
    })
  }

  toggleLighting () {
    var enabled = !this.state.enabled
    $.ajax({
      url: '/api/lighting/cycle',
      type: 'POST',
      data: JSON.stringify({
        intensities: this.state.intensities,
        spectrums: this.state.spectrums,
        enabled: enabled
      }),
      success: function (data) {
        this.setState({
          enabled: !enabled
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
    })
  }

  render () {
    var btnClass = 'btn btn-outline-danger'
    if (!this.state.updated) {
      btnClass = 'btn btn-outline-success'
    }
    var enableClass = 'btn btn-outline-success'
    var enableText = 'Enable'
    if (this.state.enabled) {
      enableText = 'Disable'
      enableClass = 'btn btn-outline-danger'
    }
    return (
      <div className='container'>
        <LEDChannel name='Intensity' onChange={this.updateIntensity} getValues={this.getIntensities} />
        <LEDChannel name='Spectrum' onChange={this.updateSpectrum} getValues={this.getSpectrums} />
        <input type='button' onClick={this.updateLighting} value='Update' className={btnClass} />
        <input type='button' onClick={this.toggleLighting} value={enableText} className={enableClass} />
      </div>
    )
  }
}
