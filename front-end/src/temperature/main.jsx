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
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { List, ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'
import AddToggle from '../ui_components/add_toggle'
import ControllerSummary from '../ui_components/controller_summary'

const RANGE_MS = { '1h': 3600000, '6h': 21600000, '1d': 86400000, '7d': 604800000, '30d': 2592000000 }

function TemperaturePrimitives ({ probe, usage, currentReading }) {
  const [range, setRange] = useState('1d')

  const cutoff = Date.now() - (RANGE_MS[range] || RANGE_MS['1d'])
  const points = ((usage && usage.current) || [])
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
    <div style={{ padding: 'var(--reefpi-space-xs) 0' }}>
      <RangeSelector value={range} onChange={setRange} compact scope={`temp-${probe.id}`} />
      {points.length > 0
        ? (
          <div style={{ marginTop: 'var(--reefpi-space-xs)' }}>
            <Sparkline
              points={points}
              stroke='var(--reefpi-color-brand)'
              fill='var(--reefpi-color-brand)'
              band={safe}
              height={56}
              hover
            />
          </div>
          )
        : <p className='reefpi-controller-empty'>{i18next.t('temperature:empty_readings', { defaultValue: 'No temperature readings yet. Data appears after the first successful sample.' })}</p>}
      {latestValue != null && (
        <div style={{ marginTop: 'var(--reefpi-space-xs)' }}>
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

const enabledLabel = value => i18next.t(value ? 'enabled' : 'disabled')

const namedTarget = (id, items = []) => {
  if (!id) return i18next.t('not_configured', { defaultValue: 'Not configured' })
  if (typeof id === 'object') return id.name || id.id || i18next.t('configured', { defaultValue: 'Configured' })
  return items.find(item => item.id === id)?.name || id
}

export function TemperatureSummary ({ probe, usage, currentReading, analogInputs, equipment, macros }) {
  const unit = probe.fahrenheit ? '°F' : '°C'
  const source = probe.sensor || namedTarget(probe.analog_input, analogInputs)
  const controlTargets = probe.is_macro ? macros : equipment
  const control = probe.control
    ? (probe.is_macro ? i18next.t('temperature:controlmacro') : i18next.t('temperature:controlequipment'))
    : i18next.t('temperature:monitoring_only', { defaultValue: 'Monitoring only' })
  const chart = probe.chart || {}
  const alertText = probe.notify && probe.notify.enable
    ? `${probe.notify.min}–${probe.notify.max} ${unit}`
    : i18next.t('disabled')

  return (
    <ControllerSummary
      sections={[
        {
          title: i18next.t('temperature:sensor_sampling', { defaultValue: 'Sensor & sampling' }),
          items: [
            { label: i18next.t('temperature:source', { defaultValue: 'Source' }), value: source },
            { label: i18next.t('temperature:unit'), value: probe.fahrenheit ? i18next.t('temperature:fahrenheit') : i18next.t('temperature:celsius') },
            { label: i18next.t('temperature:check_frequency'), value: probe.period ? `${probe.period} s` : undefined },
            { label: i18next.t('one_shot'), value: enabledLabel(probe.one_shot) }
          ]
        },
        {
          title: i18next.t('temperature:visualization_alerts', { defaultValue: 'Visualization & alerts' }),
          items: [
            { label: i18next.t('temperature:chart_range', { defaultValue: 'Chart range' }), value: chart.ymin != null && chart.ymax != null ? `${chart.ymin}–${chart.ymax} ${unit}` : undefined },
            { label: i18next.t('temperature:alert_range', { defaultValue: 'Alert range' }), value: alertText }
          ]
        },
        {
          title: i18next.t('temperature:control_safety', { defaultValue: 'Control & safety' }),
          items: [
            { label: i18next.t('temperature:control'), value: control },
            { label: i18next.t('temperature:lower_function'), value: namedTarget(probe.heater, controlTargets) },
            { label: i18next.t('temperature:upper_function'), value: namedTarget(probe.cooler, controlTargets) },
            { label: i18next.t('temperature:fail_safe'), value: enabledLabel(probe.fail_safe) }
          ]
        }
      ]}
    >
      <TemperaturePrimitives probe={probe} usage={usage} currentReading={currentReading} />
    </ControllerSummary>
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
      this.props.fetchTCUsage(probe.id)
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
          <Button
            type='button'
            name={'calibrate-probe-' + probe.id}
            variant='secondary'
            style={{ marginLeft: 'auto' }}
            onClick={e => this.calibrateProbe(e, probe)}
          >
            {i18next.t('temperature:calibrate')}
          </Button>
        )
        const handleToggleState = () => {
          probe.enable = !probe.enable
          this.props.update(probe.id, probe)
        }
        const enhancedView = (
          <TemperatureSummary
            probe={probe}
            usage={(this.props.tcUsage || {})[probe.id]}
            currentReading={(this.props.currentReading || {})[probe.id]}
            analogInputs={this.props.analogInputs}
            equipment={this.props.equipment}
            macros={this.props.macros}
          />
        )
        return (
          <Collapsible
            key={'panel-temperature-' + probe.id}
            name={'panel-temperature-' + probe.id}
            item={probe}
            buttons={calibrationButton}
            title={(
              <span className='reefpi-controller-title'>
                <span>{probe.name}</span>
                <span className='reefpi-controller-title__state'>{enabledLabel(probe.enable)}</span>
              </span>
            )}
            onDelete={this.handleDelete}
            onToggleState={handleToggleState}
            enabled={probe.enable}
            separateEdit
            overflowActions
            actionsLabel={i18next.t('temperature:actions', { name: probe.name, defaultValue: `Actions for ${probe.name}` })}
          >
            {enhancedView}
            <TemperatureForm
              tc={probe}
              showChart={false}
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
          onCancel={this.handleToggleAddProbeDiv}
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
        <List>
          <CollapsibleList>{this.probeList()}</CollapsibleList>
          <ListItem>
            <div>
              <AddToggle id='add_probe' testId='smoke-temperature-add-toggle' open={this.state.addProbe} onClick={this.handleToggleAddProbeDiv} />
            </div>
            {newProbe}
          </ListItem>
        </List>
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
