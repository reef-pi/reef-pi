import React from 'react'
import $ from 'jquery'
import Light from './light_form'
import { showError } from 'utils/alert'
import { confirm } from 'utils/confirm'
import { updateLight, fetchLights, createLight, deleteLight } from 'redux/actions/lights'
import EmptyState, { LightingIcon } from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
import { fetchJacks } from 'redux/actions/jacks'
import { connect } from 'react-redux'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import { IoMdSwitch } from 'react-icons/io'
import ManualLight from './manual_light'
import { SortByName } from 'utils/sort_by_name'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'

export const DEFAULT_CHANNEL_COLOR = '#000000'

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
        <button role='menuitem' key={i} onClick={this.setJack(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'block', padding: 'var(--reefpi-space-xs) var(--reefpi-space-sm)', width: '100%', textAlign: 'left' }}>
          <span id={'select-jack-' + jack.name}>{jack.name}</span>
        </button>
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
      enable: values.config.enable
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
      showError(i18n.t('validation:selection_required'))
      return
    }
    if ($('#lightName').val() === '') {
      showError(i18n.t('validation:name_required'))
      return
    }
    const jack = this.props.jacks[this.state.selectedJack]
    const channels = {}
    jack.pins.map((pin, idx) => (
      channels[pin] = {
        color: DEFAULT_CHANNEL_COLOR,
        manual: false,
        min: 0,
        max: 100,
        name: 'Channel-' + (idx + 1),
        on: true,
        pin,
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
      channels
    }

    this.props.createLight(payload)
    this.setState({
      addLight: !this.state.addLight
    })
    $('#lightName').val('')
  }

  lightsList () {
    return (
      this.props.lights.slice().sort((a, b) => SortByName(a, b))
        .map(light => {
          let panelContent = (
            <Light
              config={light}
              jacks={this.props.jacks}
              onSubmit={this.handleUpdateLight}
              remove={this.props.deleteLight}
            />
          )
          const mode = this.getLightMode(light)
          if (mode === 'manual') {
            panelContent = (<ManualLight light={light} handleChange={this.props.updateLight} />)
          }

          const modeButton = (
            <Button
              type='button'
              onClick={this.handleChangeMode(light)}
              variant='secondary'
              style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem', marginLeft: 'auto' }}
            >
              <><IoMdSwitch /> {this.getModeLabel(mode)}</>
            </Button>
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

  getModeLabel (mode) {
    switch (mode) {
      case 'auto':
        return i18n.t('lighting:mode_auto')
      case 'manual':
        return i18n.t('lighting:mode_manual')
      default:
        return i18n.t('lighting:mode_mixed')
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
      const oldLabel = this.getModeLabel(currentMode)
      const newLabel = this.getModeLabel(newMode)
      const message = (
        <div>
          <p>
            {i18n.t('lighting:warn_change', { name: light.name, oldmode: oldLabel, newmode: newLabel })}
          </p>
        </div>
      )
      return confirm(i18n.t('lighting:change_mode'), { description: message }).then(
        function () {
          for (const x in light.channels) {
            light.channels[x].manual = (newMode !== 'auto')
          }

          this.props.updateLight(light.id, light)
        }.bind(this)
      )
    }.bind(this)

    return fn
  }

  handleDeleteLight (light) {
    const message = (
      <div>
        <p>
          {i18n.t('lighting:warn_delete', { name: light.name })}
        </p>
      </div>
    )
    confirm(i18n.t('lighting:title_delete', { name: light.name }), { description: message }).then(
      function () {
        this.props.deleteLight(light.id)
      }.bind(this)
    )
  }

  newLightUI () {
    let jack = ''
    if (this.state.selectedJack !== undefined) {
      const j = this.props.jacks[this.state.selectedJack]
      jack = j.name
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)', alignItems: 'end' }}>
        <div>
          <label htmlFor='lightName'>{i18n.t('name')}</label>
          <input type='text' id='lightName' data-testid='smoke-light-name' style={{ display: 'block', width: '100%', padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)' }} required />
        </div>
        <div>
          <label htmlFor='jack'>{i18n.t('jack')}</label>
          <Menu buttonLabel={jack || i18n.t('select')}>
            {this.jacksList()}
          </Menu>
        </div>
        <div>
          <Button
            id='createLight'
            data-testid='smoke-light-submit'
            onClick={this.handleAddLight}
            variant='primary'
          >
            {i18n.t('add')}
          </Button>
        </div>
      </div>
    )
  }

  render () {
    let nLight = <div />
    if (this.state.addLight) {
      nLight = this.newLightUI()
    }

    if (this.props.lights.length === 0 && !this.state.addLight) {
      return (
        <EmptyState
          icon={<LightingIcon />}
          title='No lights configured'
          body='Add an LED fixture or light channel to automate your reef lighting schedule.'
          action={{ label: 'Add light', onClick: this.handleToggleAddLightDiv, testId: 'smoke-light-add-toggle' }}
        />
      )
    }

    return (
      <div>
        <CollapsibleList>
          {this.lightsList()}
        </CollapsibleList>
        <div style={{ padding: 'var(--reefpi-space-sm) 0' }}>
          <Button
            id='add_light'
            data-testid='smoke-light-add-toggle'
            onClick={this.handleToggleAddLightDiv}
            variant='secondary'
          >
            {this.state.addLight ? '-' : '+'}
          </Button>
          {nLight}
        </div>
      </div>
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
