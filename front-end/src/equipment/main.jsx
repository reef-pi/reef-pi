import React from 'react'
import Equipment from './equipment'
import { updateEquipment, fetchEquipment, createEquipment, deleteEquipment } from 'redux/actions/equipment'
import { fetchOutlets } from 'redux/actions/outlets'
import { connect } from 'react-redux'
import EquipmentForm from './equipment_form'
import { SortByName } from 'utils/sort_by_name'
import i18next from 'i18next'

class main extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedOutlet: undefined,
      addEquipment: false
    }

    this.handleAddEquipment = this.handleAddEquipment.bind(this)
    this.handleToggleAddEquipmentDiv = this.handleToggleAddEquipmentDiv.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
    this.props.fetchOutlets()
  }

  handleAddEquipment (values) {
    const payload = {
      name: values.name,
      outlet: values.outlet
    }
    this.props.create(payload)
    this.handleToggleAddEquipmentDiv()
  }

  handleToggleAddEquipmentDiv () {
    this.setState({
      addEquipment: !this.state.addEquipment
    })
  }

  render () {
    let nEq = <div />
    if (this.state.addEquipment) {
      nEq = <EquipmentForm outlets={this.props.outlets} actionLabel={i18next.t('add')} onSubmit={this.handleAddEquipment} />
    }
    return (
      <ul className='list-group list-group-flush'>
        {this.props.equipment.sort((a, b) => SortByName(a, b))
          .map(item => {
            return (
              <Equipment
                key={item.id}
                equipment={item}
                outlets={this.props.outlets}
                update={this.props.update}
                delete={this.props.delete}
              />
            )
          })}
        <li className='list-group-item add-equipment'>
          <div className='row'>
            <div className='col'>
              <input
                id='add_equipment'
                type='button'
                value={this.state.addEquipment ? '-' : '+'}
                onClick={this.handleToggleAddEquipmentDiv}
                className='btn btn-outline-success'
              />
            </div>
          </div>
          {nEq}
        </li>
      </ul>
    )
  }
}

const mapStateToProps = state => {
  return {
    equipment: state.equipment,
    outlets: state.outlets
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchEquipment()),
    fetchOutlets: () => dispatch(fetchOutlets()),
    create: e => dispatch(createEquipment(e)),
    update: (id, e) => dispatch(updateEquipment(id, e)),
    delete: id => dispatch(deleteEquipment(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
