import React from 'react'
import $ from 'jquery'
import Light from './light.jsx'
import {showAlert} from '../utils/alert.js'
import {confirm} from '../utils/confirm.js'
import {updateLight, fetchLights, createLight, deleteLight} from '../redux/actions/lights'
import {fetchJacks} from '../redux/actions/jacks'
import {connect} from 'react-redux'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      updated: false,
      enabled: false,
      addLight: false,
      selectedJack: undefined
    }
    this.lightsList = this.lightsList.bind(this)
    this.jacksList = this.jacksList.bind(this)
    this.addLight = this.addLight.bind(this)
    this.toggleAddLightDiv = this.toggleAddLightDiv.bind(this)
    this.setJack = this.setJack.bind(this)
    this.removeLight = this.removeLight.bind(this)
    this.newLightUI = this.newLightUI.bind(this)
  }

  removeLight (id) {
    return (function () {
      confirm('Are you sure ?')
        .then(function () {
          this.props.deleteLight(id)
        }.bind(this))
    }.bind(this))
  }

  componentWillMount () {
    this.props.fetchLights()
    this.props.fetchJacks()
  }

  setJack (i) {
    return () => {
      this.setState({
        selectedJack: i
      })
    }
  }

  jacksList () {
    var jacks = []
    $.each(this.props.jacks, function (i, jack) {
      jacks.push(<a className='dropdown-item' key={i} onClick={this.setJack(i)}><span id={'select-jack-' + jack.name}>{jack.name}</span></a>)
    }.bind(this))
    return jacks
  }

  addLight () {
    if (this.state.selectedJack === undefined) {
      showAlert('Select a jack')
      return
    }
    if ($('#lightName').val() === '') {
      showAlert('Specify light name')
      return
    }
    var jack = this.props.jacks[this.state.selectedJack].id
    var payload = {
      name: $('#lightName').val(),
      jack: String(jack)
    }

    this.props.createLight(payload)
    this.setState({
      addLight: !this.state.addLight
    })
    $('#lightName').val('')
  }

  lightsList () {
    var lights = []
    $.each(this.props.lights, function (i, light) {
      lights.push(
        <div key={'light-' + i} className='row'>
          <div className='container'>
            <Light config={light} hook={this.props.updateLight} />
            <input type='button' id={'remove-light-' + light.name} onClick={this.removeLight(light.id)} value='delete' className='btn btn-outline-danger col-sm-2' />
          </div>
          <hr />
        </div>
      )
    }.bind(this))
    return (lights)
  }

  toggleAddLightDiv () {
    this.setState({
      addLight: !this.state.addLight
    })
    $('#jackName').val('')
  }
  newLightUI() {
    var jack = ''
    if (this.state.selectedJack !== undefined) {
      var j = this.props.jacks[this.state.selectedJack]
      jack = j.name
    }
    return(
      <div className='row'>
        <div className='col-lg-1'>Name</div>
        <div className='col-lg-2'><input type='text' id='lightName' /></div>
        <div className='col-lg-1'/>
        <div className='col-lg-1'>Jack</div>
        <div className='col-lg-1'>
        <div className='dropdown'>
          <button className='btn btn-secondary dropdown-toggle' type='button' id='jack' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
            {jack}
          </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
           {this.jacksList()}
         </div>
       </div>
      </div>
      <div className='col-lg-1'>
        <input type='button' id='createLight' value='add' onClick={this.addLight} className='btn btn-outline-primary' />
      </div>
    </div>)
  }

  render () {
    var nLight = <div />
    if(this.state.addLight){
      nLight = this.newLightUI()
    }
    return (
      <div className='container'>
        { this.lightsList() }
        <div className='container'>
          <input id='add_light' type='button' value={this.state.addLight ? '-' : '+'} onClick={this.toggleAddLightDiv} className='btn btn-outline-success' />
          {nLight}
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    lights: state.lights,
    jacks: state.jacks
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchLights: () => dispatch(fetchLights()),
    fetchJacks: () => dispatch(fetchJacks()),
    createLight: (l) => dispatch(createLight(l)),
    deleteLight: (id) => dispatch(deleteLight(id)),
    updateLight: (id, l) => dispatch(updateLight(id, l))
  }
}

const Main = connect(mapStateToProps, mapDispatchToProps)(main)
export default Main
