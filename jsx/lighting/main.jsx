import React from 'react'
import $ from 'jquery'
import Light from './light.jsx'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import {showAlert, hideAlert} from '../utils/alert.js'
import {ajaxDelete, ajaxGet, ajaxPut} from '../utils/ajax.js'
import {confirm} from '../utils/confirm.js'

export default class Lighting extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      lights: [],
      updated: false,
      enabled: false,
      addLight: false,
      jacks: [],
      selectedJack: undefined
    }
    this.lightsList = this.lightsList.bind(this)
    this.jacksList = this.jacksList.bind(this)
    this.fetchLights = this.fetchLights.bind(this)
    this.addLight = this.addLight.bind(this)
    this.toggleAddLightDiv = this.toggleAddLightDiv.bind(this)
    this.setJack = this.setJack.bind(this)
    this.removeLight = this.removeLight.bind(this)
  }

  removeLight (id) {
    return (function () {
      confirm('Are you sure ?')
      .then(function () {
        ajaxDelete({
          url: '/api/lights/' + id,
          success: function (data) {
            this.fetchLights()
            hideAlert()
          }.bind(this)
        })
      }.bind(this))
    }.bind(this))
  }

  componentWillMount () {
    this.fetchLights()
    this.fetchJacks()
    hideAlert()
  }

  setJack (i, ev) {
    this.setState({
      selectedJack: i
    })
  }

  jacksList () {
    var jacks = []
    $.each(this.state.jacks, function (i, jack) {
      jacks.push(<MenuItem key={i} eventKey={i}><span id={'select-jack-' + jack.name}>{jack.name}</span></MenuItem>)
    })
    return jacks
  }

  addLight () {
    if (this.state.selectedJack === undefined) {
      showAlert('Select a jack')
      return
    }
    if ($('#lightName').val() === '') {
      this.setState({
        showAlert: true,
        alertMsg: 'Specify light name'
      })
      return
    }
    var jack = this.state.jacks[this.state.selectedJack].id
    var payload = {
      name: $('#lightName').val(),
      jack: String(jack)
    }
    ajaxPut({
      url: '/api/lights',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchLights()
        this.setState({
          addLight: !this.state.addLight
        })
        $('#lightName').val('')
        hideAlert()
      }.bind(this)
    })
  }

  lightsList () {
    var lights = []
    $.each(this.state.lights, function (i, light) {
      lights.push(
        <div key={'light-' + i} className='row'>
          <div className='container'>
            <Light id={light.id} name={light.name} removeHook={this.fetchLights} jack={light.jack}/>
            <input type='button' id={'remove-light-' + light.name} onClick={this.removeLight(light.id)} value='delete' className='btn btn-outline-danger col-sm-2' />
          </div>
          <hr />
        </div>
      )
    }.bind(this))
    return (lights)
  }

  fetchJacks () {
    ajaxGet({
      url: '/api/jacks',
      success: function (data) {
        this.setState({
          jacks: data
        })
        hideAlert()
      }.bind(this)
    })
  }

  fetchLights () {
    ajaxGet({
      url: '/api/lights',
      success: function (data) {
        this.setState({
          lights: data
        })
      }.bind(this)
    })
  }

  toggleAddLightDiv () {
    this.setState({
      addLight: !this.state.addLight
    })
    $('#jackName').val('')
  }

  render () {
    var jack = ''
    if (this.state.selectedJack !== undefined) {
      var j = this.state.jacks[this.state.selectedJack]
      jack = j.name
    }
    var dStyle = {
      display: this.state.addLight ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <div className='container'>
          { this.lightsList() }
        </div>
        <div className='container'>
          <input id='add_light' type='button' value={this.state.addLight ? '-' : '+'} onClick={this.toggleAddLightDiv} className='btn btn-outline-success' />
          <div style={dStyle}>
               Name: <input type='text' id='lightName' />
               Jack:
               <DropdownButton title={jack} id='jack' onSelect={this.setJack}>
                 {this.jacksList()}
               </DropdownButton>
            <input type='button' id='createLight' value='add' onClick={this.addLight} className='btn btn-outline-primary' />
          </div>
        </div>
      </div>
    )
  }
}
