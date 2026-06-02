import React, { useCallback } from 'react'
import { fetchEquipment } from '../redux/actions/equipment'
import { connect } from 'react-redux'
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'
import { useEquipmentToggle } from '../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle'
import { buildEquipmentPayload, EQUIPMENT_POLL_INTERVAL_MS, sortEquipment } from './utils'

const panelStyle = {
  display: 'grid',
  gap: 'var(--reefpi-space-sm)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  marginBottom: 'var(--reefpi-space-xxs)'
}

const itemStyle = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: 'var(--reefpi-space-xs)',
  margin: 0,
  minHeight: 'var(--reefpi-tap-target-min)'
}

// Per-item toggle with pending states — must be its own component to call hooks
function PendingEquipmentToggle ({ item, dispatch }) {
  const send = useCallback(next => {
    const payload = buildEquipmentPayload(item, { on: next === 'on' })
    return fetch(`/api/equipment/${item.id}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      dispatch(fetchEquipment())
    })
  }, [item, dispatch])

  const { mutate, state, retry } = useEquipmentToggle({
    id: item.id,
    name: item.name,
    send
  })

  return (
    <ToggleSwitch
      state={state === 'idle' || state === 'ok'
        ? (item.on ? 'on' : 'off')
        : state}
      onRequestChange={next => mutate(next)}
      onRetry={retry}
    />
  )
}

export class RawEquipmentCtrlPanel extends React.Component {
  componentDidMount () {
    this.timer = window.setInterval(this.props.fetchEquipment, EQUIPMENT_POLL_INTERVAL_MS)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  render () {
    if (this.props.equipment === undefined) {
      return <div />
    }

    return (
      <div style={panelStyle}>
        {sortEquipment(this.props.equipment)
          .map(item => (
            <label style={itemStyle} key={'eq-' + item.id}>
              <PendingEquipmentToggle item={item} dispatch={this.props.dispatch} />
              <span>{item.name}</span>
            </label>
          ))}
      </div>
    )
  }
}

export const mapStateToProps = state => {
  return {
    equipment: state.equipment,
    outlets: state.outlets
  }
}

export const mapDispatchToProps = dispatch => {
  return {
    fetchEquipment: () => dispatch(fetchEquipment()),
    dispatch
  }
}

const EquipmentCtrlPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawEquipmentCtrlPanel)

export default EquipmentCtrlPanel
