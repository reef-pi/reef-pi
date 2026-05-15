import React, { useState } from 'react'
import { confirm, showModal } from 'utils/confirm'
import DoserForm from './doser_form'
import { fetchDosingPumps, createDosingPump, deleteDosingPump, updateDosingPump, calibrateDosingPump, saveDosingPumpCalibration, fetchDoserUsage } from 'redux/actions/doser'
import { connect } from 'react-redux'
import EmptyState, { DoserIcon } from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import CalibrationModal from './calibration_modal'
import { SortByName } from 'utils/sort_by_name'
import i18n from 'utils/i18n'
import { timestampToEpoch } from 'utils/timestamp'
import RangeSelector from '../../design-system/ui_kits/reef-pi-app/primitives/RangeSelector'
import Sparkline from '../../design-system/ui_kits/reef-pi-app/primitives/Sparkline'

const RANGE_MS = { '1h': 3600000, '6h': 21600000, '1d': 86400000, '7d': 604800000, '30d': 2592000000 }

function DoserPrimitives ({ doser, usage }) {
  const [range, setRange] = useState('1d')
  if (!usage || !usage.historical) return null

  const cutoff = Date.now() - (RANGE_MS[range] || RANGE_MS['1d'])
  const points = usage.historical
    .filter(d => timestampToEpoch(d.time) >= cutoff)
    .map(d => ({ t: timestampToEpoch(d.time), v: d.pump }))
    .sort((a, b) => a.t - b.t)

  return (
    <div style={{ padding: '8px 0' }}>
      <RangeSelector value={range} onChange={setRange} compact scope={`doser-${doser.id}`} />
      <div style={{ marginTop: '8px' }}>
        <Sparkline
          points={points}
          stroke='var(--reefpi-color-brand)'
          fill='var(--reefpi-color-brand)'
          height={56}
          hover
        />
      </div>
    </div>
  )
}

export class RawDoser extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addDoser: false
    }
    this.doserList = this.doserList.bind(this)
    this.handleToggleAddDoserDiv = this.handleToggleAddDoserDiv.bind(this)
    this.handleDeleteDoser = this.handleDeleteDoser.bind(this)
    this.handleCreateDoser = this.handleCreateDoser.bind(this)
    this.handleUpdateDoser = this.handleUpdateDoser.bind(this)
    this.calibrateDoser = this.calibrateDoser.bind(this)
    this.valuesToDoser = this.valuesToDoser.bind(this)
  }

  componentDidMount () {
    if (window.FEATURE_FLAGS?.dashboard_v2) {
      this.props.dosers.forEach(doser => this.props.fetchDoserUsage(doser.id))
    }
  }

  handleToggleAddDoserDiv () {
    this.setState({
      addDoser: !this.state.addDoser
    })
  }

  doserList () {
    return (
      this.props.dosers.slice().sort((a, b) => SortByName(a, b))
        .map(doser => {
          const calibrationButton = (
            <button
              type='button' name={'calibrate-doser-' + doser.id}
              className='btn btn-sm btn-outline-info float-right'
              onClick={(e) => this.calibrateDoser(e, doser)}
            >
              {i18n.t('doser:calibrate')}
            </button>
          )
          const handleTState = () => {
            doser.regiment.enable = !doser.regiment.enable
            this.props.update(doser.id, doser)
          }
          const enhancedView = !!window.FEATURE_FLAGS?.dashboard_v2 && (
            <DoserPrimitives
              doser={doser}
              usage={this.props.doserUsage[doser.id]}
            />
          )
          return (
            <Collapsible
              key={'panel-doser-' + doser.id}
              name={'panel-doser-' + doser.id}
              item={doser}
              onToggleState={handleTState}
              enabled={doser.regiment.enable}
              buttons={calibrationButton}
              title={<b className='ml-2 align-middle'>{doser.name} </b>}
              onDelete={this.handleDeleteDoser}
            >
              {enhancedView}
              <DoserForm
                onSubmit={this.handleUpdateDoser}
                jacks={this.props.jacks}
                outlets={this.props.outlets}
                doser={doser}
              />
            </Collapsible>
          )
        })
    )
  }

  valuesToDoser (values) {
    const doser = {
      name: values.name,
      jack: values.jack,
      pin: parseInt(values.pin),
      stepper: values.stepper,
      type: values.type,
      regiment: {
        volume: parseFloat(values.volume),
        volume_per_second: parseFloat(values.volume_per_second) || 0,
        enable: values.enable,
        duration: parseFloat(values.duration),
        speed: parseInt(values.speed),
        schedule: {
          month: values.month,
          week: values.week,
          day: values.day,
          hour: values.hour,
          minute: values.minute,
          second: values.second
        }
      }
    }
    return doser
  }

  handleUpdateDoser (values) {
    const payload = this.valuesToDoser(values)
    this.props.update(values.id, payload)
  }

  handleCreateDoser (values) {
    const payload = this.valuesToDoser(values)
    this.props.create(payload)
    this.handleToggleAddDoserDiv()
  }

  handleDeleteDoser (doser) {
    const message = (
      <div>
        <p>
          {i18n.t('doser:warn_delete', { name: doser.name })}
        </p>
      </div>
    )
    confirm(i18n.t('doser:title_delete', { name: doser.name }), { description: message }).then(
      function () {
        this.props.delete(doser.id)
      }.bind(this)
    )
  }

  calibrateDoser (e, doser) {
    e.stopPropagation()
    showModal(
      <CalibrationModal
        doser={doser}
        calibrateDoser={this.props.calibrateDoser}
        saveCalibration={this.props.saveCalibration}
      />
    )
  }

  render () {
    let newDoser = null
    if (this.state.addDoser) {
      newDoser = <DoserForm onSubmit={this.handleCreateDoser} jacks={this.props.jacks} outlets={this.props.outlets} />
    }

    if (this.props.dosers.length === 0 && !this.state.addDoser) {
      return (
        <EmptyState
          icon={<DoserIcon />}
          title='No dosing pumps yet'
          body='Add a pump to automate two-part, calcium, or kalkwasser dosing.'
          action={{ label: 'Add dosing pump', onClick: this.handleToggleAddDoserDiv }}
        />
      )
    }

    return (
      <ul className='list-group list-group-flush'>
        <CollapsibleList>
          {this.doserList()}
        </CollapsibleList>
        <li className='list-group-item add-doser'>
          <div className='row'>
            <div className='col'>
              <input
                type='button'
                id='add_doser'
                data-testid='smoke-doser-add-toggle'
                value={this.state.addDoser ? '-' : '+'}
                onClick={this.handleToggleAddDoserDiv}
                className='btn btn-outline-success'
              />
            </div>
          </div>
          {newDoser}
        </li>
      </ul>
    )
  }
}

const mapStateToProps = state => {
  return {
    dosers: state.dosers,
    jacks: state.jacks,
    outlets: state.outlets,
    doserUsage: state.doser_usage || {}
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDosingPumps: () => dispatch(fetchDosingPumps()),
    create: t => dispatch(createDosingPump(t)),
    delete: id => dispatch(deleteDosingPump(id)),
    update: (id, t) => dispatch(updateDosingPump(id, t)),
    calibrateDoser: (id, p) => dispatch(calibrateDosingPump(id, p)),
    saveCalibration: (id, p) => dispatch(saveDosingPumpCalibration(id, p)),
    fetchDoserUsage: id => dispatch(fetchDoserUsage(id))
  }
}

const Doser = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawDoser)
export default Doser
