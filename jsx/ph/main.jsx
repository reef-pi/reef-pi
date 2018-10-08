import React from 'react'
import { fetchPhProbes, createProbe, updateProbe, deleteProbe, calibrateProbe } from 'redux/actions/phprobes'
import { connect } from 'react-redux'
import PhForm from './ph_form'
import Collapsible from '../ui_components/collapsible'
import CollapsibleList from '../ui_components/collapsible_list'
import { confirm, showModal } from 'utils/confirm'
import CalibrationWizard from './calibration_wizard'

class ph extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addProbe: false
    }
    this.probeList = this.probeList.bind(this)
    this.toggleAddProbeDiv = this.toggleAddProbeDiv.bind(this)
    this.deleteProbe = this.deleteProbe.bind(this)
    this.createProbe = this.createProbe.bind(this)
    this.updateProbe = this.updateProbe.bind(this)
    this.calibrateProbe = this.calibrateProbe.bind(this)
  }

  componentDidMount () {
    this.props.fetchPhProbes()
  }

  probeList () {
    return (
      this.props.probes.map(probe => {
        const calibrationButton = (
          <button type='button' name={'calibrate-probe-' + probe.id}
            disabled={probe.enable}
            title={probe.enable ? 'Ph probe must be disabled before calibration' : null}
            className='btn btn-sm btn-outline-info float-right'
            onClick={(e) => this.calibrateProbe(e, probe)}>
            Calibrate
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
              probe={probe} />
          </Collapsible>
        )
      })
    )
  }

  calibrateProbe (e, probe) {
    e.stopPropagation()
    showModal(<CalibrationWizard probe={probe} calibrateProbe={this.props.calibrateProbe} />)
  }

  valuesToProbe (values) {
    var probe = {
      name: values.name,
      address: parseInt(values.address),
      enable: values.enable,
      period: values.period,
      config: {
        notify: {
          enable: values.alerts,
          min: parseFloat(values.minAlert),
          max: parseFloat(values.maxAlert)
        }
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
        <p>This action will delete {probe.name}.</p>
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
      newProbe = <PhForm onSubmit={this.createProbe} />
    }

    return (
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
    )
  }
}

const mapStateToProps = state => {
  return {
    probes: state.phprobes
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchPhProbes: () => dispatch(fetchPhProbes()),
    create: t => dispatch(createProbe(t)),
    delete: id => dispatch(deleteProbe(id)),
    update: (id, t) => dispatch(updateProbe(id, t)),
    calibrateProbe: (id, p) => dispatch(calibrateProbe(id, p))
  }
}

const Ph = connect(
  mapStateToProps,
  mapDispatchToProps
)(ph)
export default Ph
