import React from 'react'
import {confirm} from '../utils/confirm.js'
import Chart from './chart.jsx'
import Config from './probe_config.jsx'
import Calibrate from './calibrate.jsx'
import {calibrateProbe, updateProbe, deleteProbe} from '../redux/actions/phprobes'
import {connect} from 'react-redux'

class probe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: props.data.name,
      period: props.data.period,
      enable: props.data.enable,
      address: props.data.address,
      config: props.data.config,
      readOnly: true,
      calibrate: false,
      expand: false
    }

    this.remove = this.remove.bind(this)
    this.update = this.update.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.edit = this.edit.bind(this)
    this.chart = this.chart.bind(this)
    this.updateConfig = this.updateConfig.bind(this)
    this.calibrate = this.calibrate.bind(this)
    this.expand = this.expand.bind(this)
  }

  calibrate () {
    this.setState({calibrate: !this.state.calibrate})
  }

  expand () {
    this.setState({expand: !this.state.expand})
  }

  updateConfig (d) {
    this.setState({
      config: d
    })
  }

  chart () {
    if (!this.state.enable) {
      return (<div />)
    }
    return (
      <div className='row'>
        <div className='col-sm-6'>
          <Chart probe_id={this.props.data.id} width={500} height={300} type='current' />
        </div>
        <div className='col-sm-6'>
          <Chart probe_id={this.props.data.id} width={500} height={300} type='historical' />
        </div>
      </div>
    )
  }

  edit () {
    if (this.state.readOnly) {
      this.setState({readOnly: false})
      return
    }
    var config = this.state.config
    config.notify.min = parseInt(config.notify.min)
    config.notify.max = parseInt(config.notify.max)
    var payload = {
      name: this.state.name,
      period: parseInt(this.state.period),
      enable: this.state.enable,
      address: parseInt(this.state.address),
      config: config
    }
    this.props.updateProbe(this.props.data.id, payload)
    this.setState({readOnly: true})
  }

  updateEnable (ev) {
    this.setState({enable: ev.target.checked})
  }

  remove () {
    confirm('Are you sure ?')
      .then(function () {
        this.props.deleteProbe(this.props.data.id)
        this.props.upateHook()
      }.bind(this))
  }

  update (k) {
    return (function (ev) {
      var h = {}
      h[k] = ev.target.value
      this.setState(h)
    }.bind(this))
  }

  render () {
    var editText = 'edit'
    var editClass = 'btn btn-outline-success'
    var name = <label>{this.state.name}</label>
    var details = {
      display: 'none'
    }
    var expandLabel = 'expand'
    if (this.state.expand) {
      details.display = 'block'
      expandLabel = 'fold'
    }
    if (!this.state.readOnly) {
      editText = 'save'
      editClass = 'btn btn-outline-primary'
      name = <input type='text' value={this.state.name} onChange={this.update('name')} className='col-sm-2' readOnly={this.state.readOnly} />
    }
    return (
      <div className='conainer'>
        <div className='row'>
          <div className='col-sm-9'>
            <b>{name}</b>
          </div>
          <div className='col-sm-2'>
            <input type='button' id={'expand-ph-' + this.props.data.id} onClick={this.expand} value={expandLabel} className='btn btn-outline-primary' />
          </div>
        </div>
        <div className='row' style={details}>
          <div className='container'>
            <label className='col-sm-3'>Enable</label>
            <input type='checkbox' value={this.state.enable} onChange={this.updateEnable} className='col-sm-2' defaultChecked={this.props.data.enable} disabled={this.state.readOnly} />
          </div>
          <div className='row'>
            <label className='col-sm-3'> Interval </label>
            <input type='text' value={this.state.period} onChange={this.update('period')} className='col-sm-2' readOnly={this.state.readOnly} />
          </div>
          <div className='row'>
            {this.chart()}
          </div>
          <div className='row'>
            <Config data={this.props.data.config} hook={this.updateConfig} readOnly={this.state.readOnly} />
          </div>
          <div className='row'>
            <div className='col-sm-7' />
            <div className='col-sm-2'>
              <input type='button' id={'calibrate-probe-' + this.props.data.id} onClick={this.calibrate} value='calibrate' className='btn btn-secondary' />
            </div>
            <div className='col-sm-1'>
              <input type='button' id={'edit-probe-' + this.props.data.id} onClick={this.edit} value={editText} className={editClass} />
            </div>
            <div className='col-sm-1'>
              <input type='button' id={'remove-probe-' + this.props.data.id} onClick={this.remove} value='delete' className='btn btn-outline-danger' />
            </div>
          </div>
          <div className='row'>
            { this.state.calibrate ? <Calibrate probe={this.props.data.id} hook={this.props.calibrateProbe} /> : <div /> }
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateProbe: (id, p) => dispatch(updateProbe(id, p)),
    calibrateProbe: (id, p) => dispatch(calibrateProbe(id, p)),
    deleteProbe: (id) => dispatch(deleteProbe(id))
  }
}

const Probe = connect(null, mapDispatchToProps)(probe)
export default Probe
