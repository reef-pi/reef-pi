import React from 'react'
import Sensor from './sensor'
import New from './new'
import { fetchSensors, createTC, deleteTC, updateTC, fetchTCs } from 'redux/actions/tcs'
import { connect } from 'react-redux'
import { fetchEquipment } from 'redux/actions/equipment'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.list = this.list.bind(this)
  }

  componentDidMount () {
    this.props.fetchSensors()
    this.props.fetchTCs()
    this.props.fetchEquipment()
  }

  list () {
    if (this.props.tcs === undefined) {
      return
    }
    var list = []
    this.props.tcs.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) }).forEach((v, k) => {
      list.push(
        <div key={v.id} className='list-group-item'>
          <Sensor
            data={v}
            save={this.props.updateTC}
            sensors={this.props.sensors}
            equipment={this.props.equipment}
            remove={this.props.deleteTC}
          />
        </div>
      )
    })
    return list
  }

  render () {
    return (
      <div>
        <ul className='list-group list-group-flush'>
          {this.list()}
          <New create={this.props.createTC} sensors={this.props.sensors} equipment={this.props.equipment} />
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    tcs: state.tcs,
    sensors: state.tc_sensors,
    equipment: state.equipment
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchTCs: () => dispatch(fetchTCs()),
    fetchSensors: () => dispatch(fetchSensors()),
    fetchEquipment: () => dispatch(fetchEquipment()),
    createTC: t => dispatch(createTC(t)),
    deleteTC: id => dispatch(deleteTC(id)),
    updateTC: (id, t) => dispatch(updateTC(id, t))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
