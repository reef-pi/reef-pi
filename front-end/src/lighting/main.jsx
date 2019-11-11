import React from 'react'
import $ from 'jquery'
import Light from './light_form'
import { showError } from 'utils/alert'
import { confirm } from 'utils/confirm'
import { updateLight, fetchLights, createLight, deleteLight } from 'redux/actions/lights'
import { fetchJacks } from 'redux/actions/jacks'
import { connect } from 'react-redux'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'

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
    this.handleAddLight = this.handleAddLight.bind(this)
    this.handleToggleAddLightDiv = this.handleToggleAddLightDiv.bind(this)
    this.setJack = this.setJack.bind(this)
    this.newLightUI = this.newLightUI.bind(this)
    this.handleDeleteLight = this.handleDeleteLight.bind(this)
    this.handleUpdateLight = this.handleUpdateLight.bind(this)
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
    const jacks = []
    this.props.jacks.forEach((jack, i) => {
      jacks.push(
        <a className='dropdown-item' key={i} onClick={this.setJack(i)}>
          <span id={'select-jack-' + jack.name}>{jack.name}</span>
        </a>
      )
    })
    return jacks
  }

  handleUpdateLight (values) { // TEST
    const payload = {
      id: values.config.id,
      name: values.config.name,
      channels: values.config.channels,
      jack: values.config.jack
    }

    for (const x in payload.channels) {
      if ((payload.channels[x].profile.type === 'auto') || (payload.channels[x].profile.type === 'interval')) {
        payload.channels[x].profile.type = 'interval'
        const startTime = payload.channels[x].profile.config.start.split(':')
        const endTime = payload.channels[x].profile.config.end.split(':')
        const startHour = parseInt(startTime[0])
        const startMinute = parseInt(startTime[1])
        let endHour = parseInt(endTime[0])
        const endMinute = parseInt(endTime[1])
        if ((endHour < startHour) || (endHour === startHour && endMinute < startMinute)) { endHour += 24 }

        const totalSeconds =
          (endHour * 60 * 60) + (endMinute * 60) -
          (startHour * 60 * 60) + (startMinute * 60)

        const interval = totalSeconds / (payload.channels[x].profile.config.values.length - 1)
        payload.channels[x].profile.config.interval = Math.floor(interval)
      }
    }

    this.props.updateLight(values.config.id, payload)
  }

  handleAddLight () {
    if (this.state.selectedJack === undefined) {
      showError('Select a jack')
      return
    }
    if ($('#lightName').val() === '') {
      showError('Specify light name')
      return
    }
    const jack = this.props.jacks[this.state.selectedJack].id
    const payload = {
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
    return (
      this.props.lights.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) }).map(light => { // TEST
        return (
          <Collapsible
            key={'light-' + light.id}
            name={'light-' + light.id}
            item={light}
            title={<b className='ml-2 aligtn-middle'>{light.name}</b>}
            onDelete={this.handleDeleteLight}
          >
            <Light
              config={light}
              onSubmit={this.handleUpdateLight}
              remove={this.props.deleteLight}
            />
          </Collapsible>
        )
      })
    )
  }

  handleToggleAddLightDiv () {
    this.setState({
      addLight: !this.state.addLight
    })
    $('#jackName').val('')
  }

  handleDeleteLight (light) {
    const message = (
      <div>
        <p>This action will delete {light.name}.</p>
      </div>
    )

    confirm('Delete ' + light.name, { description: message })
      .then(function () {
        this.props.deleteLight(light.id)
      }.bind(this))
  }

  newLightUI () {
    let jack = ''
    if (this.state.selectedJack !== undefined) {
      const j = this.props.jacks[this.state.selectedJack] // TEST
      jack = j.name // TEST
    }
    return (
      <div className='row'>
        <div className='col-12 col-sm-3 col-md-2 col-lg-1'>
          <label htmlFor='lightName'>Name</label>
        </div>
        <div className='col-12 col-sm-9 col-md-3 col-lg-3 mb-1'>
          <input type='text' id='lightName' className='form-control' required />
        </div>
        <div className='col-12 col-sm-3 col-md-1 col-lg-1'>
          <label htmlFor='jack'>Jack</label>
        </div>
        <div className='col-12 col-sm-9 col-md-4 col-lg-3 mb-1'>
          <div className='dropdown w-100'>
            <button
              className='btn btn-secondary dropdown-toggle w-100'
              type='button'
              id='jack'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            >
              {jack || 'Choose'}
            </button>
            <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
              {this.jacksList()}
            </div>
          </div>
        </div>
        <div className='col-12 col-sm-6 col-md-2 col-lg-1'>
          <input
            type='button'
            id='createLight'
            value='add'
            onClick={this.handleAddLight}
            className='btn btn-outline-primary'
          />
        </div>
      </div>
    )
  }

  render () {
    let nLight = <div />
    if (this.state.addLight) {
      nLight = this.newLightUI()
    }
    return (
      <ul className='list-group list-group-flush'>
        <CollapsibleList>
          {this.lightsList()}
        </CollapsibleList>
        <li className='list-group-item add-light'>
          <div className='row'>
            <div className='col'>
              <input
                id='add_light'
                type='button'
                value={this.state.addLight ? '-' : '+'}
                onClick={this.handleToggleAddLightDiv}
                className='btn btn-outline-success'
              />
            </div>
          </div>
          {nLight}
        </li>
      </ul>
    )
  }
}
const mapStateToProps = state => {
  return {
    lights: state.lights,
    jacks: state.jacks
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchLights: () => dispatch(fetchLights()),
    fetchJacks: () => dispatch(fetchJacks()),
    createLight: l => dispatch(createLight(l)), // TEST
    deleteLight: id => dispatch(deleteLight(id)),
    updateLight: (id, l) => dispatch(updateLight(id, l))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
