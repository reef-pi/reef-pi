import React from 'react'
import $ from 'jquery'
import Light from './light.jsx'
import { DropdownButton, MenuItem } from 'react-bootstrap'

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
    return(function(){
      $.ajax({
        url: '/api/lights/' + id,
        type: 'DELETE',
        success: function (data) {
          this.fetchLights()
        }.bind(this),
        error: function (xhr, status, err) {
          console.log(err.toString())
        }
      });
     }.bind(this));
  }
  componentWillMount () {
    this.fetchLights()
    this.fetchJacks()
  }

  setJack (i, ev) {
    this.setState({
      selectedJack: i
    })
  }

  jacksList () {
    var jacks = []
    $.each(this.state.jacks, function (i, jack) {
      jacks.push(<MenuItem key={i} eventKey={i}>{jack.name}</MenuItem>)
    })
    return jacks
  }

  addLight () {
    var jack = this.state.jacks[this.state.selectedJack].name
    var payload = {
      name: $('#lightName').val(),
      jack: String(jack)
    }
    $.ajax({
      url: '/api/lights',
      type: 'PUT',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchLights()
        this.setState({
          addLight: !this.state.addLight
        })
        $('#lightName').val('')
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  lightsList () {
    var lights = []
    $.each(this.state.lights, function (i, light) {
      console.log('Adding light:', light.name)
      lights.push(
        <div key={'light-'+i} className='row'>
          <Light id={light.id} name={light.name} removeHook={this.fetchLights} />
          <input type='button' id={'remove-light-' + light.id} onClick={this.removeLight(light.id)} value='delete' className='btn btn-outline-danger col-sm-2' />
        </div>
      );
    }.bind(this));
    return (lights)
  }

  fetchJacks () {
    $.ajax({
      url: '/api/jacks',
      type: 'GET',
      success: function (data) {
        this.setState({
          jacks: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
    })
  }

  fetchLights () {
    $.ajax({
      url: '/api/lights',
      type: 'GET',
      success: function (data) {
        this.setState({
          lights: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err)
      }
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
      console.log('selected jack:', this.state.selectedJack, 'jack:', j)
      jack = j.name
    }
    var dStyle = {
      display: this.state.addLight ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <div className='container'>
          <ul>
            { this.lightsList() }
          </ul>
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
