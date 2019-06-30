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
    this.toggleAddProbeDiv = this.toggleAddProbeDiv.bind(this)
    this.deleteProbe = this.deleteProbe.bind(this)
    this.createProbe = this.createProbe.bind(this)
    this.updateProbe = this.updateProbe.bind(this)
    this.dismissModal = this.dismissModal.bind(this)
  }

  componentDidMount () {
    this.props.fetchPhProbes()
  }

  probeList () {
    return (
      this.props.probes.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) }).map(probe => {
        const calibrationButton = (
          <button type='button' name={'calibrate-probe-' + probe.id}
            disabled={probe.enable}
            title={probe.enable ? 'Ph probe must be disabled before calibration' : null}
            className='btn btn-sm btn-outline-info float-right'
            onClick={(e) => this.calibrateProbe(e, probe)}>
            {i18next.t('ph:calibrate')}
          </button>
        )
        return (
          <Collapsible key={'panel-ph-' + probe.id}
            name={'panel-ph-' + probe.id}
            item={probe}
            buttons={calibrationButton}
            title={<b className='ml-2 align-middle'>{probe.name} </b>}
            onDelete={this.deleteProbe}>
            <PhForm onSubmit={this.updateProbe}
              key={Number(probe.id)}
              analogInputs={this.props.ais}
              probe={probe} />
          </Collapsible>
        )
      })
    )
  }

  calibrateProbe (e, probe) {
    this.setState({currentProbe: probe, showCalibrate: true})
  }

  dismissModal () {
    this.setState({currentProbe: null, showCalibrate: false})
  }

  valuesToProbe (values) {
    var probe = {
      name: values.name,
      enable: values.enable,
      period: values.period,
      analog_input: values.analog_input,
      notify: {
        enable: values.notify,
        min: parseFloat(values.minAlert),
        max: parseFloat(values.maxAlert)
      }
    }
    return probe
  }

  updateProbe (values) {
    var payload = this.valuesToProbe(values)

    this.props.update(values.id, payload)
  }

  createProbe (values) {
    var payload = this.valuesToProbe(values)

    this.props.create(payload)
    this.toggleAddProbeDiv()
  }

  deleteProbe (probe) {
    const message = (
      <div>
        <p>{i18next.t('ph:warn_delete')} {probe.name}.</p>
      </div>
    )

    confirm('Delete ' + probe.name, {description: message})
      .then(function () {
        this.props.delete(probe.id)
      }.bind(this))
  }

  toggleAddProbeDiv () {
    this.setState({
      addProbe: !this.state.addProbe
    })
  }

  render () {
    var newProbe = null
    if (this.state.addProbe) {
      newProbe = <PhForm
        analogInputs={this.props.ais}
        onSubmit={this.createProbe}
      />
    }

    var calibrationModal = null
    if (this.state.showCalibrate) {
      calibrationModal = <CalibrationWizard probe={this.state.currentProbe}
        currentReading={this.props.currentReading}
        readProbe={this.props.readProbe}
        calibrateProbe={this.props.calibrateProbe}
        confirm={this.dismissModal}
        cancel={this.dismissModal} />
    }

    return (
      <div>
        {calibrationModal}
        <ul className='list-group list-group-flush'>
          <CollapsibleList>
            {this.probeList()}
          </CollapsibleList>
          <li className='list-group-item add-probe'>
            <div className='row'>
              <div className='col'>
                <input
                  type='button'
                  id='add_probe'
                  value={this.state.addProbe ? '-' : '+'}
                  onClick={this.toggleAddProbeDiv}
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
    currentReading: state.ph_reading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchPhProbes: () => dispatch(fetchPhProbes()),
    create: t => dispatch(createProbe(t)),
    delete: id => dispatch(deleteProbe(id)),
    update: (id, t) => dispatch(updateProbe(id, t)),
    calibrateProbe: (id, p) => dispatch(calibrateProbe(id, p)),
    readProbe: (id) => dispatch(readProbe(id))
  }
}

const Ph = connect(
  mapStateToProps,
  mapDispatchToProps
)(ph)
export default Ph
