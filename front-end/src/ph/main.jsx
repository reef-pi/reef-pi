import React from 'react'
import { fetchPhProbes, createProbe, updateProbe, deleteProbe, calibrateProbe, readProbe } from 'redux/actions/phprobes'
import { connect } from 'react-redux'
import PhForm from './ph_form'
import Collapsible from '../ui_components/collapsible'
import CollapsibleList from '../ui_components/collapsible_list'
import { confirm } from 'utils/confirm'
import CalibrationWizard from './calibration_wizard'
import i18next from 'i18next'

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
    this.handleCreateProbe = this.handleCreateProbe.bind(this)
    this.handleUpdateProbe = this.handleUpdateProbe.bind(this)
    this.dismissModal = this.dismissModal.bind(this)
  }

  componentDidMount () {
    this.props.fetchPhProbes()
  }

  // *** sort pH probes by name instead of id - JFR 20201118 - modified 20201201
  probeList () {
    return this.props.probes
      .sort((a, b) => {
        return a.name.localeCompare(b.name, 
                                    navigator.languages[0] || navigator.language, 
                                    {numeric: true, ignorePunctuation: true})
      })
      .map(probe => {
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
        return (
          <Collapsible
            key={'panel-ph-' + probe.id}
            name={'panel-ph-' + probe.id}
            item={probe}
            buttons={calibrationButton}
            title={<b className='ml-2 align-middle'>{probe.name} </b>}
            onDelete={this.handleDeleteProbe}
          >
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

  // *** added chart_y_min, chart_y_max - JFR 20201111
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

  handleDeleteProbe (probe) {
    const message = (
      <div>
        <p>
          {i18next.t('ph:warn_delete')} {probe.name}.
        </p>
      </div>
    )

    confirm('Delete ' + probe.name, { description: message }).then(
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
      newProbe =
        <PhForm
          analogInputs={this.props.ais}
          onSubmit={this.handleCreateProbe}
          macros={this.props.macros}
          equipment={this.props.equipment}
        />
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
    readProbe: id => dispatch(readProbe(id))
  }
}

const Ph = connect(
  mapStateToProps,
  mapDispatchToProps
)(ph)
export default Ph
