import React from 'react'
import $ from 'jquery'
import Sensor from './sensor.jsx'
import New from './new.jsx'
import {fetchSensors, createTC, deleteTC, updateTC, fetchTCs} from '../redux/actions/tcs'
import {connect} from 'react-redux'
import {confirm} from '../utils/confirm.js'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.list = this.list.bind(this)
    this.remove = this.remove.bind(this)
  }

  componentDidMount () {
    this.props.fetchSensors()
    this.props.fetchTCs()
  }

  remove (id) {
    return (function () {
      confirm('Are you sure ?')
        .then(function () {
          this.props.deleteTC(id)
        }.bind(this))
    }.bind(this))
  }

  list () {
    if (this.props.tcs === undefined) {
      return
    }
    var list = []
    var index = 0
    $.each(this.props.tcs, function (k, v) {
      list.push(
        <div key={k} className='list-group-item'>
          <Sensor data={v} save={this.props.updateTC} sensors={this.props.sensors} remove={this.remove(v.id)} />
        </div>
      )
      index = index + 1
    }.bind(this))
    return list
  }

  render () {
    return (
      <div className='container'>
        <ul className='list-group list-group-flush'>
          {this.list()}
        </ul>
        <New create={this.props.createTC} sensors={this.props.sensors} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    tcs: state.tcs,
    sensors: state.tc_sensors
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTCs: () => dispatch(fetchTCs()),
    fetchSensors: () => dispatch(fetchSensors()),
    createTC: (t) => dispatch(createTC(t)),
    deleteTC: (id) => dispatch(deleteTC(id)),
    updateTC: (id, t) => dispatch(updateTC(id, t))
  }
}

const Main = connect(mapStateToProps, mapDispatchToProps)(main)
export default Main
