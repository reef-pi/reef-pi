import React from 'react'
import TemperatureForm from './temperature_form'
import { fetchSensors, createTC, deleteTC, updateTC, fetchTCs, readTC } from 'redux/actions/tcs'
import { connect } from 'react-redux'
import { fetchEquipment } from 'redux/actions/equipment'
import Collapsible from '../ui_components/collapsible'
import CollapsibleList from '../ui_components/collapsible_list'
import CalibrationModal from './calibration_modal'
import i18next from 'i18next'
import { confirm } from 'utils/confirm'

class main extends React.Component {
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
    this.handleCreate = this.handleCreate.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.dismissModal = this.dismissModal.bind(this)
    this.handleCalibrate = this.handleCalibrate.bind(this)
  }

  componentDidMount () {
    this.props.fetchSensors()
    this.props.fetchTCs()
    this.props.fetchEquipment()
    this.props.probes.map(probe => {
      this.props.readTC(probe.id)
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
      heater: values.heater,
      cooler: values.cooler,
      min: parseFloat(values.min),
      max: parseFloat(values.max),
      hysteresis: parseFloat(values.hysteresis),
      sensor: values.sensor,
      period: parseInt(values.period),
      fahrenheit: values.fahrenheit,
      notify: {
        enable: values.alerts,
        min: parseFloat(values.minAlert),
        max: parseFloat(values.maxAlert)
      }
    }
    return payload
  }

  probeList () {
    return this.props.probes
      .sort((a, b) => {
        return parseInt(a.id) < parseInt(b.id)
      })
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
            <TemperatureForm
              tc={probe}
              showChart
              sensors={this.props.sensors}
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
    probe.calibration_points = [{
      expected: value,
      observed: this.props.currentReading[probe.id]
    }]

    this.props.update(probe.id, probe)
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

  handleDelete (probe) {
    const message = (
      <div>
        <p>
          {i18next.t('temperature:warn_delete')} {probe.name}.
        </p>
      </div>
    )

    confirm('Delete ' + probe.name, { description: message }).then(
      function () {
        this.props.delete(probe.id)
      }.bind(this)
    )
  }

  render () {
    let newProbe = null
    if (this.state.addProbe) {
      newProbe =
        <TemperatureForm
          sensors={this.props.sensors}
          equipment={this.props.equipment}
          macros={this.props.macros}
          onSubmit={this.handleCreate}
        />
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
    equipment: state.equipment,
    macros: state.macros,
    currentReading: state.tc_reading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchTCs: () => dispatch(fetchTCs()),
    fetchSensors: () => dispatch(fetchSensors()),
    fetchEquipment: () => dispatch(fetchEquipment()),
    create: t => dispatch(createTC(t)),
    delete: id => dispatch(deleteTC(id)),
    update: (id, t) => dispatch(updateTC(id, t)),
    readTC: id => dispatch(readTC(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
