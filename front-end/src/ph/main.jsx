import React, { useState } from 'react'
import { fetchPhProbes, createProbe, updateProbe, deleteProbe, calibrateProbe, readProbe, fetchProbeReadings } from 'redux/actions/phprobes'
import { connect } from 'react-redux'
import PhForm from './ph_form'
import Collapsible from '../ui_components/collapsible'
import EmptyState from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
import CollapsibleList from '../ui_components/collapsible_list'
import { confirm } from 'utils/confirm'
import CalibrationWizard from './calibration_wizard'
import i18next from 'i18next'
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

function PhPrimitives ({ probe, readings, currentReading }) {
  const [range, setRange] = useState('1d')
  if (!readings || !readings.current || readings.current.length === 0) {
    return <p className='reefpi-controller-empty'>{i18next.t('ph:empty_readings', { defaultValue: 'No pH readings yet. Data appears after the first successful sample.' })}</p>
  }

  const cutoff = Date.now() - (RANGE_MS[range] || RANGE_MS['1d'])
  const points = readings.current
    .filter(d => timestampToEpoch(d.time) >= cutoff)
    .map(d => ({ t: timestampToEpoch(d.time), v: d.value }))
    .sort((a, b) => a.t - b.t)

  const latestValue = currentReading != null ? currentReading : (points.length ? points[points.length - 1].v : null)
  const safe = (probe.min != null && probe.max != null) ? [probe.min, probe.max] : undefined
  const warn = (probe.notify && probe.notify.enable && probe.notify.min != null && probe.notify.max != null)
    ? [probe.notify.min, probe.notify.max]
    : undefined

  return (
    <div style={{ padding: 'var(--reefpi-space-xs) 0' }}>
      <RangeSelector value={range} onChange={setRange} compact scope={`ph-${probe.id}`} />
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
      {latestValue != null && (
        <div style={{ marginTop: 'var(--reefpi-space-xs)' }}>
          <ThresholdGauge
            value={latestValue}
            safe={safe}
            warn={warn}
            unit='pH'
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
  return items.find(item => item.id === id)?.name || id
}

const range = (min, max, unit) => (min != null && max != null ? `${min}–${max}${unit ? ' ' + unit : ''}` : undefined)

// Read-only view of a probe (#3301): labelled values, not disabled form controls.
export function PhSummary ({ probe, readings, currentReading, analogInputs, equipment, macros }) {
  const chart = probe.chart || {}
  const unit = chart.unit || ''
  const targets = probe.is_macro ? macros : equipment
  const controlled = probe.control === true
  const control = controlled
    ? (probe.is_macro ? i18next.t('ph:controlmacro') : i18next.t('ph:controlequipment'))
    : i18next.t('ph:monitoring_only', { defaultValue: 'Monitoring only' })

  const controlItems = [{ label: i18next.t('ph:control'), value: control }]
  if (controlled) {
    controlItems.push(
      { label: i18next.t('ph:upper_threshold'), value: probe.max },
      { label: i18next.t('ph:upper_function'), value: namedTarget(probe.upper_eq, targets) },
      { label: i18next.t('ph:lower_threshold'), value: probe.min },
      { label: i18next.t('ph:lower_function'), value: namedTarget(probe.downer_eq, targets) },
      { label: i18next.t('ph:hysteresis'), value: probe.hysteresis }
    )
  }
  if (probe.transformer) controlItems.push({ label: i18next.t('ph:transformer'), value: probe.transformer })

  return (
    <ControllerSummary
      sections={[
        {
          title: i18next.t('ph:probe_sampling', { defaultValue: 'Probe & sampling' }),
          items: [
            { label: i18next.t('analog_input'), value: namedTarget(probe.analog_input, analogInputs) },
            { label: i18next.t('ph:check_frequency'), value: probe.period ? `${probe.period} s` : undefined },
            { label: i18next.t('one_shot'), value: enabledLabel(probe.one_shot) }
          ]
        },
        {
          title: i18next.t('ph:chart_alerts', { defaultValue: 'Chart & alerts' }),
          items: [
            { label: i18next.t('ph:chart_range', { defaultValue: 'Chart range' }), value: range(chart.ymin, chart.ymax, unit) },
            { label: i18next.t('ph:alert_range', { defaultValue: 'Alert range' }), value: probe.notify && probe.notify.enable ? range(probe.notify.min, probe.notify.max, unit) : i18next.t('disabled') }
          ]
        },
        { title: i18next.t('ph:control_section', { defaultValue: 'Control' }), items: controlItems }
      ]}
    >
      <PhPrimitives probe={probe} readings={readings} currentReading={currentReading} />
    </ControllerSummary>
  )
}

// Calibration needs the probe off (the controller would otherwise act on the readings mid-calibration);
// say so next to the action instead of only in a tooltip.
export function CalibrateAction ({ probe, onCalibrate }) {
  const hintId = 'ph-calibrate-hint-' + probe.id
  return (
    <span className='ph-calibrate-action'>
      <Button
        type='button'
        name={'calibrate-probe-' + probe.id}
        disabled={probe.enable}
        aria-describedby={probe.enable ? hintId : undefined}
        variant='secondary'
        onClick={e => onCalibrate(e, probe)}
      >
        {i18next.t('ph:calibrate')}
      </Button>
      {probe.enable && (
        <span id={hintId} className='ph-calibrate-action__hint'>
          {i18next.t('ph:calibrate_requires_off', { defaultValue: 'Turn the probe off to calibrate' })}
        </span>
      )}
    </span>
  )
}

class ph extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addProbe: false,
      showCalibrate: false,
      currentProbe: null
    }
    this.probeList = this.probeList.bind(this)
    this.handleToggleAddProbeDiv = this.handleToggleAddProbeDiv.bind(this)
    this.handleDeleteProbe = this.handleDeleteProbe.bind(this)
    // for future use
    // this.handleResetProbe = this.handleResetProbe.bind(this)
    this.handleCreateProbe = this.handleCreateProbe.bind(this)
    this.handleUpdateProbe = this.handleUpdateProbe.bind(this)
    this.dismissModal = this.dismissModal.bind(this)
  }

  componentDidMount () {
    this.props.fetchPhProbes()
    this.props.probes.forEach(probe => this.props.fetchProbeReadings?.(probe.id))
  }

  probeList () {
    return this.props.probes.slice()
      .sort((a, b) => SortByName(a, b))
      .map(probe => {
        const handleToggleState = () => {
          probe.enable = !probe.enable
          this.props.update(probe.id, probe)
        }
        const calibrationButton = <CalibrateAction probe={probe} onCalibrate={(e, p) => this.calibrateProbe(e, p)} />
        return (
          <Collapsible
            key={'panel-ph-' + probe.id}
            name={'panel-ph-' + probe.id}
            item={probe}
            buttons={calibrationButton}
            title={(
              <span className='reefpi-controller-title'>
                <span>{probe.name}</span>
                <span className='reefpi-controller-title__state'>{enabledLabel(probe.enable)}</span>
              </span>
            )}
            onDelete={this.handleDeleteProbe}
            onToggleState={handleToggleState}
            enabled={probe.enable}
            separateEdit
            overflowActions
            actionsLabel={i18next.t('ph:actions', { name: probe.name, defaultValue: `Actions for ${probe.name}` })}
          >
            <PhSummary
              probe={probe}
              readings={(this.props.phReadings || {})[probe.id]}
              currentReading={(this.props.currentReading || {})[probe.id]}
              analogInputs={this.props.ais}
              equipment={this.props.equipment}
              macros={this.props.macros}
            />
            <PhForm
              onSubmit={this.handleUpdateProbe}
              key={Number(probe.id)}
              analogInputs={this.props.ais}
              probe={probe}
              macros={this.props.macros}
              equipment={this.props.equipment}
            />
          </Collapsible>
        )
      })
  }

  calibrateProbe (e, probe) {
    this.setState({ currentProbe: probe, showCalibrate: true })
  }

  dismissModal () {
    this.setState({ currentProbe: null, showCalibrate: false })
  }

  valuesToProbe (values) {
    const probe = {
      name: values.name,
      enable: values.enable,
      period: values.period,
      analog_input: values.analog_input,
      notify: {
        enable: values.notify,
        min: parseFloat(values.minAlert),
        max: parseFloat(values.maxAlert)
      },
      chart: values.chart,
      control: (values.control === 'macro' || values.control === 'equipment'),
      is_macro: (values.control === 'macro'),
      one_shot: values.one_shot || false,
      min: parseFloat(values.lowerThreshold),
      downer_eq: values.lowerFunction,
      max: parseFloat(values.upperThreshold),
      upper_eq: values.upperFunction,
      transformer: values.transformer,
      hysteresis: parseFloat(values.hysteresis),
      chart_y_min: parseInt(values.chart_y_min),
      chart_y_max: parseInt(values.chart_y_max)
    }
    return probe
  }

  handleUpdateProbe (values) {
    const payload = this.valuesToProbe(values)
    this.props.update(values.id, payload)
  }

  handleCreateProbe (values) {
    const payload = this.valuesToProbe(values)
    this.props.create(payload)
    this.handleToggleAddProbeDiv()
  }

  // for future use :-)
  //  handleResetProbe (probe) {
  //    const message = (
  //      <div>
  //        <p>
  //          {i18next.t('ph:warn_reset', {name: probe.name})}
  //        </p>
  //      </div>
  //    )
  //    confirm(i18next.t('reset'), { description: message }).then(
  //      function () {
  //        this.props.reset(probe.id)
  //      }.bind(this)
  //    )
  //  }

  handleDeleteProbe (probe) {
    const message = (
      <div>
        <p>
          {i18next.t('ph:warn_delete', { name: probe.name })}
        </p>
      </div>
    )
    confirm(i18next.t('delete'), { description: message }).then(
      function () {
        this.props.delete(probe.id)
      }.bind(this)
    )
  }

  handleToggleAddProbeDiv () {
    this.setState({
      addProbe: !this.state.addProbe
    })
  }

  render () {
    let newProbe = null
    if (this.state.addProbe) {
      newProbe = (
        <PhForm
          analogInputs={this.props.ais}
          onSubmit={this.handleCreateProbe}
          macros={this.props.macros}
          equipment={this.props.equipment}
        />
      )
    }

    let calibrationModal = null
    if (this.state.showCalibrate) {
      calibrationModal = (
        <CalibrationWizard
          probe={this.state.currentProbe}
          currentReading={this.props.currentReading}
          readProbe={this.props.readProbe}
          calibrateProbe={this.props.calibrateProbe}
          confirm={this.dismissModal}
          cancel={this.dismissModal}
        />
      )
    }

    if (this.props.probes.length === 0 && !this.state.addProbe) {
      return (
        <div>
          {calibrationModal}
          <EmptyState
            title={i18next.t('ph:empty_title', { defaultValue: 'No pH probes yet' })}
            body={i18next.t('ph:empty_body', { defaultValue: 'Add a probe to monitor and control reef pH.' })}
            action={{ label: i18next.t('ph:add_probe', { defaultValue: 'Add pH probe' }), onClick: this.handleToggleAddProbeDiv, testId: 'smoke-ph-add-toggle' }}
          />
        </div>
      )
    }

    return (
      <div>
        {calibrationModal}
        <List>
          <CollapsibleList>{this.probeList()}</CollapsibleList>
          <ListItem>
            <div>
              <AddToggle id='add_probe' testId='smoke-ph-add-toggle' open={this.state.addProbe} onClick={this.handleToggleAddProbeDiv} />
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
    probes: state.phprobes,
    ais: state.analog_inputs,
    currentReading: state.ph_reading,
    phReadings: state.ph_readings || {},
    macros: state.macros,
    equipment: state.equipment
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchPhProbes: () => dispatch(fetchPhProbes()),
    create: t => dispatch(createProbe(t)),
    delete: id => dispatch(deleteProbe(id)),
    update: (id, t) => dispatch(updateProbe(id, t)),
    calibrateProbe: (id, p) => dispatch(calibrateProbe(id, p)),
    readProbe: id => dispatch(readProbe(id)),
    fetchProbeReadings: id => dispatch(fetchProbeReadings(id))
  }
}

const Ph = connect(
  mapStateToProps,
  mapDispatchToProps
)(ph)
export { ph as RawPhMain }
export default Ph
