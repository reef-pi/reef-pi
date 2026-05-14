import React, { useState } from 'react'
import TemperatureForm from './temperature_form'
import { fetchSensors, createTC, deleteTC, updateTC, fetchTCs, fetchTCUsage, readTC, calibrateTemperature } from 'redux/actions/tcs'
import { connect } from 'react-redux'
import { fetchEquipment } from 'redux/actions/equipment'
import { fetchAnalogInputs } from 'redux/actions/analog_inputs'
import Collapsible from '../ui_components/collapsible'
import CollapsibleList from '../ui_components/collapsible_list'
import CalibrationModal from './calibration_modal'
import i18next from 'i18next'
import { confirm } from 'utils/confirm'
import { SortByName } from 'utils/sort_by_name'
import { timestampToEpoch } from 'utils/timestamp'
import RangeSelector from '../../design-system/ui_kits/reef-pi-app/primitives/RangeSelector'
import Sparkline from '../../design-system/ui_kits/reef-pi-app/primitives/Sparkline'
import ThresholdGauge from '../../design-system/ui_kits/reef-pi-app/primitives/ThresholdGauge'

const RANGE_MS = { '1h': 3600000, '6h': 21600000, '1d': 86400000, '7d': 604800000, '30d': 2592000000 }

function TemperaturePrimitives ({ probe, usage, currentReading }) {
  const [range, setRange] = useState('1d')
  if (!usage || !usage.current) return null

  const cutoff = Date.now() - (RANGE_MS[range] || RANGE_MS['1d'])
  const points = usage.current
    .filter(d => timestampToEpoch(d.time) >= cutoff)
    .map(d => ({ t: timestampToEpoch(d.time), v: d.value }))
    .sort((a, b) => a.t - b.t)

  const latestValue = currentReading != null ? currentReading : (points.length ? points[points.length - 1].v : null)
  const unit = probe.fahrenheit ? '°F' : '°C'
  const safe = (probe.min != null && probe.max != null) ? [probe.min, probe.max] : undefined
  const warn = (probe.notify && probe.notify.enable && probe.notify.min != null && probe.notify.max != null)
    ? [probe.notify.min, probe.notify.max]
    : undefined

  return (
    <div style={{ padding: '8px 0' }}>
      <RangeSelector value={range} onChange={setRange} compact scope={`temp-${probe.id}`} />
      <div style={{ marginTop: '8px' }}>
        <Sparkline
          points={points}
          stroke='var(--reefpi-color-brand)'
          fill='var(--reefpi-color-brand)'
          band={safe}
          height={56}
          hover
        />
      </div>
      {latestValue != null && (
        <div style={{ marginTop: '8px' }}>
          <ThresholdGauge
            value={latestValue}
            safe={safe}
            warn={warn}
            unit={unit}
            label={probe.name}
          />
        </div>
      )}
    </div>
  )
}

export class RawTemperatureMain extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addProbe: false,
      showCalibrate: false,
      currentProbe: null,
      defaultCalibrationPoint: ''
    }
    this.probeList = this.probeList.bind(this)
    this.handleToggleAddProbeDiv = this.handleToggleAddProbeDiv.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    // for future use
    // this.handleReset = this.handleReset.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.dismissModal = this.dismissModal.bind(this)
    this.handleCalibrate = this.handleCalibrate.bind(this)
  }

  componentDidMount () {
    this.props.fetchSensors()
    this.props.fetchTCs()
    this.props.fetchEquipment()
    this.props.fetchAnalogInputs()
    this.props.probes.forEach(probe => {
      this.props.readTC(probe.id)
      if (window.FEATURE_FLAGS?.dashboard_v2) {
        this.props.fetchTCUsage(probe.id)
      }
    })
  }

  handleToggleAddProbeDiv () {
    this.setState({
      addProbe: !this.state.addProbe
    })
  }

  valuesToProbe (values) {
    const payload = {
      name: values.name,
      enable: values.enable,
      control: (values.control === 'macro' || values.control === 'equipment'),
      is_macro: (values.control === 'macro'),
      one_shot: values.one_shot,
      fail_safe: values.fail_safe,
      heater: values.heater,
      cooler: values.cooler,
      min: parseFloat(values.min),
      max: parseFloat(values.max),
      hysteresis: parseFloat(values.hysteresis),
      sensor: values.sensor,
      analog_input: values.analog_input || '',
      period: parseInt(values.period),
      fahrenheit: values.fahrenheit,
      notify: {
        enable: values.alerts,
        min: parseFloat(values.minAlert),
        max: parseFloat(values.maxAlert)
      },
      chart: {
        color: values.chart.color,
        ymin: parseFloat(values.chart.ymin),
        ymax: parseFloat(values.chart.ymax)
      }
    }
    return payload
  }

  probeList () {
    return this.props.probes.slice()
      .sort((a, b) => SortByName(a, b))
      .map(probe => {
        const calibrationButton = (
          <button
            type='button'
            name={'calibrate-probe-' + probe.id}
            className='btn btn-sm btn-outline-info float-right'
            onClick={e => this.calibrateProbe(e, probe)}
          >
            {i18next.t('temperature:calibrate')}
          </button>
        )
        const handleToggleState = () => {
          probe.enable = !probe.enable
          this.props.update(probe.id, probe)
        }
        const enhancedView = !!window.FEATURE_FLAGS?.dashboard_v2 && (
          <TemperaturePrimitives
            probe={probe}
            usage={this.props.tcUsage[probe.id]}
            currentReading={this.props.currentReading[probe.id]}
          />
        )
        return (
          <Collapsible
            key={'panel-temperature-' + probe.id}
            name={'panel-temperature-' + probe.id}
            item={probe}
            buttons={calibrationButton}
            title={<b className='ml-2 align-middle'>{probe.name} </b>}
            onDelete={this.handleDelete}
            onToggleState={handleToggleState}
            enabled={probe.enable}
          >
            {enhancedView}
            <TemperatureForm
              tc={probe}
              showChart={!window.FEATURE_FLAGS?.dashboard_v2}
              sensors={this.props.sensors}
              analogInputs={this.props.analogInputs}
              equipment={this.props.equipment}
              macros={this.props.macros}
              onSubmit={this.handleUpdate}
            />
          </Collapsible>
        )
      })
  }

  calibrateProbe (e, probe) {
    let defaultValue = ''
    if (probe.calibration_points && probe.calibration_points[0]) {
      defaultValue = probe.calibration_points[0].expected
    }

    this.setState({
      currentProbe: probe,
      showCalibrate: true,
      defaultCalibrationPoint: defaultValue
    })
  }

  dismissModal () {
    this.setState({ currentProbe: null, showCalibrate: false })
  }

  handleCalibrate (probe, value) {
    const calibrationPoints = [{
      expected: value,
      observed: this.props.currentReading[probe.id]
    }]

    this.props.calibrateSensor(probe.id, calibrationPoints)
    this.setState({ currentProbe: null, showCalibrate: false })
  }

  handleUpdate (values) {
    const payload = this.valuesToProbe(values)
    this.props.update(values.id, payload)
  }

  handleCreate (values) {
    const payload = this.valuesToProbe(values)
    this.props.create(payload)
    this.handleToggleAddProbeDiv()
  }

  // for future use :-)
  //  handleReset (probe) {
  //    const message = (
  //      <div>
  //        <p>
  //          {i18next.t('temperature:warn_reset', {name: probe.name})}
  //        </p>
  //      </div>
  //    )
  //    confirm(i18next.t('reset'), { description: message }).then(
  //      function () {
  //        this.props.reset(probe.id)
  //      }.bind(this)
  //    )
  //  }

  handleDelete (probe) {
    const message = (
      <div>
        <p>
          {i18next.t('temperature:warn_delete', { name: probe.name })}
        </p>
      </div>
    )
    confirm(i18next.t('delete'), { description: message }).then(
      function () {
        this.props.delete(probe.id)
      }.bind(this)
    )
  }

  render () {
    let newProbe = null
    if (this.state.addProbe) {
      newProbe = (
        <TemperatureForm
          sensors={this.props.sensors}
          analogInputs={this.props.analogInputs}
          equipment={this.props.equipment}
          macros={this.props.macros}
          onSubmit={this.handleCreate}
        />
      )
    }

    let calibrationModal = null
    if (this.state.showCalibrate) {
      calibrationModal = (
        <CalibrationModal
          probe={this.state.currentProbe}
          currentReading={this.props.currentReading}
          defaultValue={this.state.defaultCalibrationPoint}
          readProbe={this.props.readTC}
          calibrateProbe={this.props.calibrateProbe}
          cancel={this.dismissModal}
          onSubmit={this.handleCalibrate}
        />
      )
    }

    return (
      <div>
        {calibrationModal}
        <ul className='list-group list-group-flush'>
          <CollapsibleList>{this.probeList()}</CollapsibleList>
          <li className='list-group-item add-temperature'>
            <div className='row'>
              <div className='col'>
                <input
                  type='button'
                  id='add_probe'
                  data-testid='smoke-temperature-add-toggle'
                  value={this.state.addProbe ? '-' : '+'}
                  onClick={this.handleToggleAddProbeDiv}
                  className='btn btn-outline-success'
                />
              </div>
            </div>
            {newProbe}
          </li>
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    probes: state.tcs,
    sensors: state.tc_sensors,
    analogInputs: state.analog_inputs,
    equipment: state.equipment,
    macros: state.macros,
    currentReading: state.tc_reading,
    tcUsage: state.tc_usage || {}
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchTCs: () => dispatch(fetchTCs()),
    fetchSensors: () => dispatch(fetchSensors()),
    fetchEquipment: () => dispatch(fetchEquipment()),
    fetchAnalogInputs: () => dispatch(fetchAnalogInputs()),
    create: t => dispatch(createTC(t)),
    delete: id => dispatch(deleteTC(id)),
    update: (id, t) => dispatch(updateTC(id, t)),
    readTC: id => dispatch(readTC(id)),
    fetchTCUsage: id => dispatch(fetchTCUsage(id)),
    calibrateSensor: (id, t) => dispatch(calibrateTemperature(id, t))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawTemperatureMain)
export default Main
