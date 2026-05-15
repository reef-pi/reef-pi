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

const RANGE_MS = { '1h': 3600000, '6h': 21600000, '1d': 86400000, '7d': 604800000, '30d': 2592000000 }

function PhPrimitives ({ probe, readings, currentReading }) {
  const [range, setRange] = useState('1d')
  if (!readings || !readings.current) return null

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
    <div style={{ padding: '8px 0' }}>
      <RangeSelector value={range} onChange={setRange} compact scope={`ph-${probe.id}`} />
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
            unit='pH'
            label={probe.name}
          />
        </div>
      )}
    </div>
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
    if (window.FEATURE_FLAGS?.dashboard_v2) {
      this.props.probes.forEach(probe => this.props.fetchProbeReadings(probe.id))
    }
  }

  probeList () {
    return this.props.probes.slice()
      .sort((a, b) => SortByName(a, b))
      .map(probe => {
        const handleToggleState = () => {
          probe.enable = !probe.enable
          this.props.update(probe.id, probe)
        }
        const calibrationButton = (
          <button
            type='button'
            name={'calibrate-probe-' + probe.id}
            disabled={probe.enable}
            title={probe.enable ? 'Ph probe must be disabled before calibration' : null}
            className='btn btn-sm btn-outline-info float-right'
            onClick={e => this.calibrateProbe(e, probe)}
          >
            {i18next.t('ph:calibrate')}
          </button>
        )
        const enhancedView = !!window.FEATURE_FLAGS?.dashboard_v2 && (
          <PhPrimitives
            probe={probe}
            readings={this.props.phReadings[probe.id]}
            currentReading={this.props.currentReading[probe.id]}
          />
        )
        return (
          <Collapsible
            key={'panel-ph-' + probe.id}
            name={'panel-ph-' + probe.id}
            item={probe}
            buttons={calibrationButton}
            title={<b className='ml-2 align-middle'>{probe.name} </b>}
            onDelete={this.handleDeleteProbe}
            onToggleState={handleToggleState}
            enabled={probe.enable}
          >
            {enhancedView}
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
            title='No pH probes yet'
            body='Add a probe to monitor and control reef pH.'
            action={{ label: 'Add pH probe', onClick: this.handleToggleAddProbeDiv }}
          />
        </div>
      )
    }

    return (
      <div>
        {calibrationModal}
        <ul className='list-group list-group-flush'>
          <CollapsibleList>{this.probeList()}</CollapsibleList>
          <li className='list-group-item add-probe'>
            <div className='row'>
              <div className='col'>
                <input
                  type='button'
                  id='add_probe'
                  data-testid='smoke-ph-add-toggle'
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
