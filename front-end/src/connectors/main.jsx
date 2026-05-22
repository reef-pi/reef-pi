import React from 'react'
import Outlets from './outlets'
import Jacks from './jacks'
import AnalogInputs from './analog_inputs'
import Inlets from './inlets'
import i18n from 'utils/i18n'
import { confirm } from 'utils/confirm'
import { connect } from 'react-redux'
import { fetchDrivers } from 'redux/actions/drivers'
import { fetchOutlets, deleteOutlet, updateOutlet } from 'redux/actions/outlets'
import { fetchInlets, deleteInlet, updateInlet } from 'redux/actions/inlets'
import { fetchJacks, deleteJack, updateJack } from 'redux/actions/jacks'
import { fetchAnalogInputs, deleteAnalogInput, updateAnalogInput } from 'redux/actions/analog_inputs'

const CONNECTOR_KINDS = {
  inlet: { label: 'Inlet', deleteProp: 'deleteInlet', updateProp: 'updateInlet' },
  outlet: { label: 'Outlet', deleteProp: 'deleteOutlet', updateProp: 'updateOutlet' },
  analog: { label: 'Analog input', deleteProp: 'deleteAnalogInput', updateProp: 'updateAnalogInput' },
  jack: { label: 'Jack', deleteProp: 'deleteJack', updateProp: 'updateJack' }
}

const getLocalStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return undefined
  return window.localStorage
}

const readGroupOpenState = driverName => {
  const storage = getLocalStorage()
  if (!storage) return true
  const value = storage.getItem('reefpi.connectors.' + driverName + '.open')
  return value === null ? true : value === 'true'
}

const driverDisplayName = (driverMap, driverId) => {
  return (driverMap[driverId] || {}).name || driverId || 'Unassigned'
}

const pinCountForDriver = driver => {
  if (!driver || !driver.pinmap) return 0
  return Object.keys(driver.pinmap).reduce((total, kind) => total + (driver.pinmap[kind] || []).length, 0)
}

const pinmapKindToConnectorKind = kind => {
  if (kind === 'digital-output') return 'outlet'
  if (kind === 'digital-input') return 'inlet'
  if (kind === 'analog-input') return 'analog'
  if (kind === 'pwm') return 'jack'
  return kind
}

const gridChannelsForGroup = group => {
  if (!group.driver || !group.driver.pinmap) return group.channels
  const byKindAndPin = {}
  group.channels.forEach(channel => {
    channel.pins.forEach(pin => {
      byKindAndPin[channel.kind + ':' + pin] = channel
    })
  })
  const displayChannels = []
  Object.keys(group.driver.pinmap).sort().forEach(pinmapKind => {
    const kind = pinmapKindToConnectorKind(pinmapKind)
    ;(group.driver.pinmap[pinmapKind] || []).forEach(pin => {
      displayChannels.push(byKindAndPin[kind + ':' + pin] || {
        id: group.driver.id + ':' + kind + ':' + pin,
        name: 'Available',
        kind,
        driver: group.driver.id,
        pins: [pin],
        placeholder: true
      })
    })
  })
  return displayChannels
}

const buildChannels = props => {
  const channels = []
  ;(props.inlets || []).forEach(conn => channels.push({ ...conn, kind: 'inlet', pins: [conn.pin] }))
  ;(props.outlets || []).forEach(conn => channels.push({ ...conn, kind: 'outlet', pins: [conn.pin] }))
  ;(props.analog_inputs || []).forEach(conn => channels.push({ ...conn, kind: 'analog', pins: [conn.pin] }))
  ;(props.jacks || []).forEach(conn => channels.push({ ...conn, kind: 'jack', pins: conn.pins || [] }))
  return channels
}

const markConflicts = channels => {
  const pinMap = {}
  channels.forEach(channel => {
    channel.pins.forEach(pin => {
      const key = channel.driver + ':' + pin
      if (!pinMap[key]) pinMap[key] = []
      pinMap[key].push(channel.id)
    })
  })
  return channels.map(channel => {
    const conflict = channel.pins.some(pin => (pinMap[channel.driver + ':' + pin] || []).length > 1)
    return { ...channel, conflict }
  })
}

const selectedKey = channel => channel.kind + ':' + channel.id

const batchMovePayload = (channel, driver) => {
  const payload = {
    name: channel.name,
    driver
  }
  if (channel.reverse !== undefined) payload.reverse = channel.reverse
  if (channel.kind === 'jack') payload.pins = channel.pins || []
  else payload.pin = channel.pin
  if (channel.equipment) payload.equipment = channel.equipment
  return payload
}

class connectors extends React.Component {
  constructor (props) {
    super(props)
    const openGroups = {}
    ;(props.drivers || []).forEach(driver => {
      openGroups[driver.name || driver.id] = readGroupOpenState(driver.name || driver.id)
    })
    this.state = {
      filter: '',
      inUseOnly: false,
      conflictsOnly: false,
      selected: {},
      batchDriver: '',
      openGroups
    }
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.handleInUseOnlyToggle = this.handleInUseOnlyToggle.bind(this)
    this.handleConflictsOnlyToggle = this.handleConflictsOnlyToggle.bind(this)
    this.toggleGroup = this.toggleGroup.bind(this)
    this.toggleSelection = this.toggleSelection.bind(this)
    this.handleBatchDelete = this.handleBatchDelete.bind(this)
    this.handleBatchDriverChange = this.handleBatchDriverChange.bind(this)
    this.handleBatchMove = this.handleBatchMove.bind(this)
  }

  componentDidMount () {
    if (this.props.fetchDrivers) this.props.fetchDrivers()
    if (this.props.fetchOutlets) this.props.fetchOutlets()
    if (this.props.fetchInlets) this.props.fetchInlets()
    if (this.props.fetchJacks) this.props.fetchJacks()
    if (this.props.fetchAnalogInputs) this.props.fetchAnalogInputs()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.drivers === this.props.drivers) return
    const nextOpenGroups = { ...this.state.openGroups }
    ;(this.props.drivers || []).forEach(driver => {
      const driverName = driver.name || driver.id
      if (nextOpenGroups[driverName] === undefined) nextOpenGroups[driverName] = readGroupOpenState(driverName)
    })
    this.setState({ openGroups: nextOpenGroups })
  }

  handleFilterChange (e) {
    this.setState({ filter: e.target.value })
  }

  handleInUseOnlyToggle () {
    this.setState({ inUseOnly: !this.state.inUseOnly })
  }

  handleConflictsOnlyToggle () {
    this.setState({ conflictsOnly: !this.state.conflictsOnly })
  }

  handleBatchDriverChange (e) {
    this.setState({ batchDriver: e.target.value })
  }

  toggleGroup (driverName) {
    const open = !this.state.openGroups[driverName]
    const storage = getLocalStorage()
    if (storage) storage.setItem('reefpi.connectors.' + driverName + '.open', String(open))
    this.setState({
      openGroups: {
        ...this.state.openGroups,
        [driverName]: open
      }
    })
  }

  toggleSelection (channel) {
    const key = selectedKey(channel)
    const selected = { ...this.state.selected }
    if (selected[key]) delete selected[key]
    else selected[key] = channel
    this.setState({ selected })
  }

  selectedChannels () {
    return Object.keys(this.state.selected).map(key => this.state.selected[key])
  }

  handleBatchDelete () {
    const selected = this.selectedChannels()
    if (selected.length === 0) return
    const names = selected.map(channel => channel.name).join(', ')
    const message = <div><p>Delete {selected.length} connectors: {names}</p></div>
    confirm('Delete selected connectors?', { description: message }).then(() => {
      selected.forEach(channel => {
        const deleteProp = CONNECTOR_KINDS[channel.kind].deleteProp
        this.props[deleteProp](channel.id)
      })
      this.setState({ selected: {} })
    })
  }

  handleBatchMove () {
    const selected = this.selectedChannels()
    if (selected.length === 0 || !this.state.batchDriver) return
    selected.forEach(channel => {
      const updateProp = CONNECTOR_KINDS[channel.kind].updateProp
      this.props[updateProp](channel.id, batchMovePayload(channel, this.state.batchDriver))
    })
    this.setState({ selected: {} })
  }

  groups () {
    const driverMap = {}
    ;(this.props.drivers || []).forEach(driver => { driverMap[driver.id] = driver })
    const filter = this.state.filter.trim().toLowerCase()
    const channels = markConflicts(buildChannels(this.props))
      .filter(channel => {
        const haystack = [
          channel.name,
          channel.driver,
          driverDisplayName(driverMap, channel.driver),
          String(channel.pin),
          (channel.pins || []).join(',')
        ].join(' ').toLowerCase()
        if (filter && !haystack.includes(filter)) return false
        if (this.state.inUseOnly && !channel.equipment) return false
        if (this.state.conflictsOnly && !channel.conflict) return false
        return true
      })

    const grouped = {}
    channels.forEach(channel => {
      const driverName = driverDisplayName(driverMap, channel.driver)
      if (!grouped[driverName]) {
        grouped[driverName] = {
          driverName,
          driver: driverMap[channel.driver] || { id: channel.driver, name: driverName },
          channels: []
        }
      }
      grouped[driverName].channels.push(channel)
    })

    return Object.keys(grouped).sort().map(driverName => grouped[driverName])
  }

  renderFilterRow () {
    const selected = this.selectedChannels()
    const selectedCount = selected.length
    const batchDrivers = this.props.drivers || []
    return (
      <div className='connectors-filter-row'>
        <input
          type='search'
          className='form-control connectors-search'
          placeholder='Search name, pin, or driver'
          value={this.state.filter}
          onChange={this.handleFilterChange}
          aria-label='Search connectors'
        />
        <label className='connectors-toggle'>
          <input type='checkbox' checked={this.state.inUseOnly} onChange={this.handleInUseOnlyToggle} />
          <span>In use</span>
        </label>
        <label className='connectors-toggle'>
          <input type='checkbox' checked={this.state.conflictsOnly} onChange={this.handleConflictsOnlyToggle} />
          <span>Conflicts</span>
        </label>
        <select
          className='custom-select connectors-batch-driver'
          disabled={selectedCount === 0}
          value={this.state.batchDriver}
          onChange={this.handleBatchDriverChange}
          aria-label='Move selected to driver'
        >
          <option value=''>Move to driver</option>
          {batchDrivers.map(driver => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
        </select>
        <button type='button' className='btn btn-outline-primary' disabled={selectedCount === 0 || !this.state.batchDriver} onClick={this.handleBatchMove}>Move</button>
        <button type='button' className='btn btn-outline-danger' disabled={selectedCount === 0} onClick={this.handleBatchDelete}>Delete {selectedCount || ''}</button>
      </div>
    )
  }

  renderChannelList (channels) {
    return (
      <div className='connector-channel-list'>
        {channels.map(channel => {
          const selected = !!this.state.selected[selectedKey(channel)]
          return (
            <button
              type='button'
              key={selectedKey(channel)}
              className={'connector-list-row' + (selected ? ' selected' : '') + (channel.conflict ? ' connector-conflict' : '')}
              onClick={() => this.toggleSelection(channel)}
            >
              <span className='connector-status-dot' />
              <span className='connector-list-main'>
                <strong>{channel.name}</strong>
                <small>{CONNECTOR_KINDS[channel.kind].label} - pin {(channel.pins || []).join(', ')}</small>
              </span>
              {channel.equipment ? <span className='connector-badge'>in use</span> : <span className='connector-badge available'>available</span>}
              {channel.conflict ? <span className='connector-badge warning'>conflict</span> : null}
            </button>
          )
        })}
      </div>
    )
  }

  renderChannelGrid (channels) {
    return (
      <div className='connector-channel-grid'>
        {channels.map(channel => {
          const selected = !!this.state.selected[selectedKey(channel)]
          return (
            <button
              type='button'
              key={selectedKey(channel)}
              className={'connector-channel-cell' + (selected ? ' selected' : '') + (channel.conflict ? ' connector-conflict' : '') + (channel.placeholder ? ' available' : '')}
              onClick={channel.placeholder ? undefined : () => this.toggleSelection(channel)}
              title={channel.name}
            >
              <span className='connector-cell-pin'>{(channel.pins || []).join(', ')}</span>
              <span className='connector-status-dot' />
              <span className='connector-cell-kind'>{CONNECTOR_KINDS[channel.kind].label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  renderGroup (group) {
    const open = this.state.openGroups[group.driverName] !== false
    const used = group.channels.length
    const total = Math.max(pinCountForDriver(group.driver), group.channels.length)
    const driverName = String(group.driverName || group.driver.id || '').toLowerCase()
    const highCount = total > 8 && driverName.includes('pca9685')
    const hasConflict = group.channels.some(channel => channel.conflict)
    return (
      <section className='connector-group' key={group.driverName}>
        <button type='button' className='connector-group-header' onClick={() => this.toggleGroup(group.driverName)}>
          <span className='connector-group-title'>{group.driverName}</span>
          <span className='connector-count-pill'>{used} / {total} used</span>
          {hasConflict ? <span className='connector-badge warning'>conflicts</span> : null}
          <span className='connector-group-add'>+ Add</span>
          <span className='connector-group-caret'>{open ? '-' : '+'}</span>
        </button>
        {open
          ? highCount
            ? this.renderChannelGrid(gridChannelsForGroup(group))
            : this.renderChannelList(group.channels)
          : null}
      </section>
    )
  }

  renderNewShell () {
    const groups = this.groups()
    return (
      <div className='container connectors-shell'>
        {this.renderFilterRow()}
        <div className='connector-groups'>
          {groups.length > 0
            ? groups.map(group => this.renderGroup(group))
            : <div className='connector-empty-state'>No connectors match the current filters.</div>}
        </div>
      </div>
    )
  }

  renderLegacy () {
    return (
      <div className='container'>
        <div className='row inlets'>
          <Inlets />
        </div>
        <hr />
        <div className='row outlets'>
          <Outlets />
        </div>
        <hr />
        <div className='row analog-inputs'>
          <AnalogInputs />
        </div>
        <hr />
        <div className='row jacks'>
          <Jacks />
        </div>

      </div>
    )
  }

  render () {
    if (this.props.drivers === undefined ||
          this.props.drivers.length === 0) {
      return (
        <div className='container'>
          {i18n.t('loading')}
        </div>
      )
    }

    if (typeof window !== 'undefined' && window.FEATURE_FLAGS && window.FEATURE_FLAGS.new_shell) {
      return this.renderNewShell()
    }

    return this.renderLegacy()
  }
}

export const mapStateToProps = state => {
  return {
    drivers: state.drivers,
    outlets: state.outlets,
    inlets: state.inlets,
    jacks: state.jacks,
    analog_inputs: state.analog_inputs
  }
}

export const mapDispatchToProps = dispatch => {
  return {
    fetchDrivers: () => dispatch(fetchDrivers()),
    fetchOutlets: () => dispatch(fetchOutlets()),
    fetchInlets: () => dispatch(fetchInlets()),
    fetchJacks: () => dispatch(fetchJacks()),
    fetchAnalogInputs: () => dispatch(fetchAnalogInputs()),
    deleteOutlet: id => dispatch(deleteOutlet(id)),
    deleteInlet: id => dispatch(deleteInlet(id)),
    deleteJack: id => dispatch(deleteJack(id)),
    deleteAnalogInput: id => dispatch(deleteAnalogInput(id)),
    updateOutlet: (id, outlet) => dispatch(updateOutlet(id, outlet)),
    updateInlet: (id, inlet) => dispatch(updateInlet(id, inlet)),
    updateJack: (id, jack) => dispatch(updateJack(id, jack)),
    updateAnalogInput: (id, analogInput) => dispatch(updateAnalogInput(id, analogInput))
  }
}

const Connectors = connect(
  mapStateToProps,
  mapDispatchToProps
)(connectors)
export { connectors as RawConnectors }
export default Connectors
