import React, { useCallback } from 'react'
import { fetchEquipment } from '../redux/actions/equipment'
import { connect } from 'react-redux'
import ToggleSwitch from '../../design-system/ui_kits/reef-pi-app/primitives/ToggleSwitch'
import { useEquipmentToggle } from '../../design-system/ui_kits/reef-pi-app/hooks/useEquipmentToggle'
import { buildEquipmentPayload, EQUIPMENT_POLL_INTERVAL_MS, sortEquipment } from './utils'

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
      <div className='container' style={{ marginBottom: '3px' }}>
        <div className='row'>
          {sortEquipment(this.props.equipment)
            .map(item => (
              <div className='col-12 col-sm-6 col-md-2 col-lg-3 order-sm-3' key={'eq-' + item.id}>
                <label className='d-inline-flex align-items-center mb-0'>
                  <PendingEquipmentToggle item={item} dispatch={this.props.dispatch} />
                  <span className='ml-2'>{item.name}</span>
                </label>
              </div>
            ))}
        </div>
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
