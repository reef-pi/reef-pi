import React from 'react'
import $ from 'jquery'
import Equipment from './equipment'
import {showAlert} from 'utils/alert'
import {confirm} from 'utils/confirm'
import {updateEquipment, fetchEquipment, createEquipment, deleteEquipment} from 'redux/actions/equipment'
import {fetchOutlets} from 'redux/actions/outlets'
import {connect} from 'react-redux'
import EquipmentForm from './equipment_form'

class main extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedOutlet: undefined,
      addEquipment: false
    }

    this.addEquipment = this.addEquipment.bind(this)

    this.toggleAddEquipmentDiv = this.toggleAddEquipmentDiv.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
    this.props.fetchOutlets()
  }


  addEquipment (values) {

    var payload = {
      name: values.name,
      outlet: values.outlet
    }
    this.props.create(payload)
    this.toggleAddEquipmentDiv()
  }

  toggleAddEquipmentDiv () {
    this.setState({
      addEquipment: !this.state.addEquipment
    })
  }

  render () {
    var nEq = <div />
    if (this.state.addEquipment) {
      nEq = (<EquipmentForm
        outlets = {this.props.outlets}
        actionLabel = 'Add'
        onSubmit = {this.addEquipment} />)
    }
    return (
      <div className='container'>
        <ul className='list-group list-group-flush'>
          {
            this.props.equipment.map((item) => {
              return (
                <Equipment key={item.id}
                  equipment={item}
                  outlets={this.props.outlets}
                  update = {this.props.update}
                  delete = {this.props.delete} />
              )
            })
          }
          <li className='list-group-item'>
            <div className='row'>
              <div className='col'>
                <input id='add_equipment' type='button' value={this.state.addEquipment ? '-' : '+'} onClick={this.toggleAddEquipmentDiv} className='btn btn-outline-success' />
              </div>
            </div>
            {nEq}
          </li>
        </ul>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    equipment: state.equipment,
    outlets: state.outlets
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: () => dispatch(fetchEquipment()),
    fetchOutlets: () => dispatch(fetchOutlets()),
    create: (e) => dispatch(createEquipment(e)),
    update: (id, e) => dispatch(updateEquipment(id, e)),
    delete: (id) => dispatch(deleteEquipment(id))
  }
}

const Main = connect(mapStateToProps, mapDispatchToProps)(main)
export default Main
