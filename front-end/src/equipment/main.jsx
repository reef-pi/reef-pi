import React from 'react'
import Equipment from './equipment'
import { updateEquipment, fetchEquipment, createEquipment, deleteEquipment } from 'redux/actions/equipment'
import { fetchOutlets } from 'redux/actions/outlets'
import { connect } from 'react-redux'
import EquipmentForm from './equipment_form'
import { SORT_NAME_AZ, SORT_NAME_ZA, SORT_ON_FIRST, SORT_OFF_FIRST, sortEquipment } from './utils'
import i18next from 'i18next'
import EmptyState, { EquipmentIcon } from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'

const sortOptions = [
  { value: SORT_NAME_AZ, label: 'equipment:sort_name_az' },
  { value: SORT_NAME_ZA, label: 'equipment:sort_name_za' },
  { value: SORT_ON_FIRST, label: 'equipment:sort_on_first' },
  { value: SORT_OFF_FIRST, label: 'equipment:sort_off_first' }
]

export class RawEquipmentMain extends React.Component {
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
    const sorted = sortEquipment(this.props.equipment, this.state.sortMode)
    const newEquipmentForm = this.state.addEquipment
      ? <EquipmentForm outlets={this.props.outlets} actionLabel={i18next.t('add')} onSubmit={this.handleAddEquipment} />
      : <div />

    if (sorted.length === 0 && !this.state.addEquipment) {
      return (
        <EmptyState
          icon={<EquipmentIcon />}
          title={i18next.t('equipment:no_equipment', 'No equipment yet')}
          body={i18next.t('equipment:no_equipment_body', 'Add your first pump, heater, or skimmer.')}
          action={{ label: i18next.t('equipment:add', 'Add equipment'), onClick: this.handleToggleAddEquipmentDiv }}
        />
      )
    }

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
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{i18next.t(option.label)}</option>
                ))}
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
                data-testid='smoke-equipment-add-toggle'
                type='button'
                value={this.state.addEquipment ? '-' : '+'}
                onClick={this.handleToggleAddEquipmentDiv}
                className='btn btn-outline-success'
              />
            </div>
          </div>
          {newEquipmentForm}
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
)(RawEquipmentMain)
export default Main
