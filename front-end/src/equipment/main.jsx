import React from 'react'
import Equipment from './equipment'
import { updateEquipment, fetchEquipment, createEquipment, deleteEquipment } from 'redux/actions/equipment'
import { fetchOutlets } from 'redux/actions/outlets'
import { connect } from 'react-redux'
import EquipmentForm from './equipment_form'
import { SORT_NAME_AZ, SORT_NAME_ZA, SORT_ON_FIRST, SORT_OFF_FIRST, sortEquipment } from './utils'
import i18next from 'i18next'
import EmptyState, { EquipmentIcon } from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'
import { List, ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'

const sortOptions = [
  { value: SORT_NAME_AZ, label: 'equipment:sort_name_az' },
  { value: SORT_NAME_ZA, label: 'equipment:sort_name_za' },
  { value: SORT_ON_FIRST, label: 'equipment:sort_on_first' },
  { value: SORT_OFF_FIRST, label: 'equipment:sort_off_first' }
]

const sortRowStyle = {
  alignItems: 'end',
  display: 'grid',
  gap: 'var(--reefpi-space-sm)',
  gridTemplateColumns: 'minmax(12rem, 18rem)',
  justifyContent: 'start'
}

const addRowStyle = {
  alignItems: 'start',
  display: 'grid',
  gap: 'var(--reefpi-space-sm)',
  justifyItems: 'start'
}

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
      : null

    if (sorted.length === 0 && !this.state.addEquipment) {
      return (
        <EmptyState
          icon={<EquipmentIcon />}
          title={i18next.t('equipment:no_equipment', 'No equipment yet')}
          body={i18next.t('equipment:no_equipment_body', 'Add your first pump, heater, or skimmer.')}
          action={{ label: i18next.t('equipment:add', 'Add equipment'), onClick: this.handleToggleAddEquipmentDiv, testId: 'smoke-equipment-add-toggle' }}
        />
      )
    }

    return (
      <List density='roomy'>
        <ListItem style={sortRowStyle}>
          <Field id='equipment-sort' label={i18next.t('equipment:sort')}>
            <Select
              id='equipment-sort'
              value={this.state.sortMode}
              onChange={this.handleSortChange}
              options={sortOptions.map(option => ({ value: option.value, label: i18next.t(option.label) }))}
            />
          </Field>
        </ListItem>
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
        <ListItem style={addRowStyle}>
          <Button
            id='add_equipment'
            data-testid='smoke-equipment-add-toggle'
            type='button'
            variant='secondary'
            onClick={this.handleToggleAddEquipmentDiv}
            aria-expanded={this.state.addEquipment}
            aria-label={this.state.addEquipment ? i18next.t('close') : i18next.t('equipment:add', 'Add equipment')}
          >
            {this.state.addEquipment ? '-' : '+'}
          </Button>
          {newEquipmentForm}
        </ListItem>
      </List>
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
