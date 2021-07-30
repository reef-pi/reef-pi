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
import { IoMdSwitch } from 'react-icons/io'
import ManualLight from './manual_light'
import { SortByName } from 'utils/sort_by_name'
import i18next from 'i18next'

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
    this.handleChangeMode = this.handleChangeMode.bind(this)
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

  handleUpdateLight (values) {
    const payload = {
      id: values.config.id,
      name: values.config.name,
      channels: values.config.channels,
      jack: values.config.jack,
      enable: true
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

        if ((endHour < startHour) || (endHour === startHour && endMinute < startMinute)) {
          endHour += 24
        }

        const totalSeconds =
          ((endHour * 60 * 60) + (endMinute * 60)) -
          ((startHour * 60 * 60) + (startMinute * 60))

        const interval = totalSeconds / (payload.channels[x].profile.config.values.length - 1)
        payload.channels[x].profile.config.interval = Math.floor(interval)
      } else if (payload.channels[x].profile.type === 'lunar') {
        const date = payload.channels[x].profile.config.full_moon
        const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' })
        const [{ value: month },, { value: day },, { value: year }] = dateTimeFormat.formatToParts(date)
        payload.channels[x].profile.config.full_moon = `${year}-${month}-${day}`
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
    const jack = this.props.jacks[this.state.selectedJack]
    const channels = {}
    jack.pins.map((pin, idx) => (
      channels[pin] = {
        color: '',
        manual: false,
        min: 0,
        max: 100,
        name: 'Channel-' + (idx + 1),
        on: true,
        pin: pin,
        value: 0,
        profile: {
          type: 'fixed',
          config: {
            start: '00:00:00',
            end: '23:59:59',
            value: 0
          }
        }
      }
    ))
    const payload = {
      name: $('#lightName').val(),
      jack: String(jack.id),
      enable: true,
      channels: channels
    }

    this.props.createLight(payload)
    this.setState({
      addLight: !this.state.addLight
    })
    $('#lightName').val('')
  }

  lightsList () {
    return (
      this.props.lights.sort((a, b) => SortByName(a, b))
        .map(light => {
          let panelContent = (
            <Light
              config={light}
              onSubmit={this.handleUpdateLight}
              remove={this.props.deleteLight}
            />
          )
          let modeContent = ''
          const mode = this.getLightMode(light)
          switch (mode) {
            case 'auto':
              modeContent = (<><IoMdSwitch /> Auto</>)
              break
            case 'manual':
              modeContent = (<><IoMdSwitch /> Manual</>)
              panelContent = (<ManualLight light={light} handleChange={this.props.updateLight} />)
              break
            default:
              modeContent = (<><IoMdSwitch /> Mixed</>)
          }

          const modeButton = (
            <button type='button' onClick={this.handleChangeMode(light)} className='btn btn-sm btn-outline-info float-right'>
              {modeContent}
            </button>
          )

          return (
            <Collapsible
              key={'light-' + light.id}
              name={'light-' + light.id}
              item={light}
              buttons={modeButton}
              title={<b className='ml-2 aligtn-middle'>{light.name}</b>}
              onDelete={this.handleDeleteLight}
              disableEdit={mode === 'manual'}
            >
              {panelContent}
            </Collapsible>
          )
        })
    )
  }

  getLightMode (light) {
    if (Object.values(light.channels).every(x => { return x.manual === false })) {
      return 'auto'
    } else if (Object.values(light.channels).every(x => { return x.manual === true })) {
      return 'manual'
    } else {
      return 'mixed'
    }
  }

  handleToggleAddLightDiv () {
    this.setState({
      addLight: !this.state.addLight
    })
    $('#jackName').val('')
  }

  handleChangeMode (light) {
    const currentMode = this.getLightMode(light)
    const fn = function () {
      let newMode = 'auto'
      if (currentMode === 'auto') {
        newMode = 'manual'
      }
      const message = (
        <div>
          <p>This action will change the mode for {light.name} from {currentMode} to {newMode}.</p>
        </div>
      )

      return confirm('Change Mode', { description: message })
        .then(function () {
          for (const x in light.channels) {
            light.channels[x].manual = (newMode !== 'auto')
          }

          this.props.updateLight(light.id, light)
        }.bind(this))
    }.bind(this)

    return fn
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
      const j = this.props.jacks[this.state.selectedJack]
      jack = j.name
    }
    return (
      <div className='row'>
        <div className='col-12 col-sm-3 col-md-2 col-lg-1'>
          <label htmlFor='lightName'>{i18next.t('name')}</label>
        </div>
        <div className='col-12 col-sm-9 col-md-3 col-lg-3 mb-1'>
          <input type='text' id='lightName' className='form-control' required />
        </div>
        <div className='col-12 col-sm-3 col-md-1 col-lg-1'>
          <label htmlFor='jack'>{i18next.t('jack')}</label>
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
              {jack || i18next.t('select')}
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
            value={i18next.t('add')}
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

/* istanbul ignore next */
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
export const TestMain = main
