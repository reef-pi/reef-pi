import React from 'react'
import Equipment from './equipment'
import { updateEquipment, fetchEquipment, createEquipment, deleteEquipment } from 'redux/actions/equipment'
import { fetchOutlets } from 'redux/actions/outlets'
import { connect } from 'react-redux'
import EquipmentForm from './equipment_form'
import { SortByName } from 'utils/sort_by_name'
import i18next from 'i18next'

const SORT_NAME_AZ = 'name_az'
const SORT_NAME_ZA = 'name_za'
const SORT_ON_FIRST = 'on_first'
const SORT_OFF_FIRST = 'off_first'

function sortEquipment (equipment, mode) {
  const copy = [...equipment]
  switch (mode) {
    case SORT_NAME_ZA:
      return copy.sort((a, b) => SortByName(b, a))
    case SORT_ON_FIRST:
      return copy.sort((a, b) => (b.on ? 1 : 0) - (a.on ? 1 : 0) || SortByName(a, b))
    case SORT_OFF_FIRST:
      return copy.sort((a, b) => (a.on ? 1 : 0) - (b.on ? 1 : 0) || SortByName(a, b))
    default:
      return copy.sort((a, b) => SortByName(a, b))
  }
}

class main extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedOutlet: undefined,
      addEquipment: false,
      sortMode: SORT_NAME_AZ
    }

    this.handleAddEquipment = this.handleAddEquipment.bind(this)
    this.handleToggleAddEquipmentDiv = this.handleToggleAddEquipmentDiv.bind(this)
    this.handleSortChange = this.handleSortChange.bind(this)
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

  handleSortChange (ev) {
    this.setState({ sortMode: ev.target.value })
  }

  render () {
    let nEq = <div />
    if (this.state.addEquipment) {
      nEq = <EquipmentForm outlets={this.props.outlets} actionLabel={i18next.t('add')} onSubmit={this.handleAddEquipment} />
    }
    const sorted = sortEquipment(this.props.equipment, this.state.sortMode)
    return (
      <ul className='list-group list-group-flush'>
        <li className='list-group-item'>
          <div className='row align-items-center'>
            <div className='col-auto'>
              <label htmlFor='equipment-sort' className='col-form-label'>{i18next.t('equipment:sort')}</label>
            </div>
            <div className='col-auto'>
              <select
                id='equipment-sort'
                className='form-control form-control-sm'
                value={this.state.sortMode}
                onChange={this.handleSortChange}
              >
                <option value={SORT_NAME_AZ}>{i18next.t('equipment:sort_name_az')}</option>
                <option value={SORT_NAME_ZA}>{i18next.t('equipment:sort_name_za')}</option>
                <option value={SORT_ON_FIRST}>{i18next.t('equipment:sort_on_first')}</option>
                <option value={SORT_OFF_FIRST}>{i18next.t('equipment:sort_off_first')}</option>
              </select>
            </div>
          </div>
        </li>
        {sorted.map(item => {
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
