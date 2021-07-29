import React from 'react'
import ViewEquipment from './view_equipment'
import EquipmentForm from './equipment_form'
import { confirm } from 'utils/confirm'
import i18next from 'i18next'

export default class Equipment extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      readOnly: true
    }

    this.handleToggleEdit = this.handleToggleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  selectedOutlet () {
    for (let i = 0; i < this.props.outlets.length; i++) {
      if (this.props.outlets[i].id === this.props.equipment.outlet) return this.props.outlets[i]
    }
    return { name: '' }
  }

  handleToggleEdit (e) {
    e.stopPropagation()
    this.setState({ readOnly: false })
  }

  handleSubmit (values) {
    const id = values.id

    const payload = {
      name: values.name,
      outlet: values.outlet,
      on: values.on,
      stay_off_on_boot: values.stay_off_on_boot
    }

    this.props.update(id, payload).then(() => {
      this.setState({ readOnly: true })
    })
  }

  handleDelete (e) {
    e.stopPropagation()
    const message = (
      <div>
        <p>This action will delete {this.props.equipment.name}.</p>
      </div>
    )

    confirm('Delete ' + this.props.equipment.name, { description: message })
      .then(function () {
        this.props.delete(this.props.equipment.id)
      }.bind(this))
  }

  handleUpdate (id, values) {
    this.props.update(id, values)
  }

  render () {
    return (
      <li className='list-group-item'>
        {this.state.readOnly === true
          ? <ViewEquipment equipment={this.props.equipment} outletName={this.selectedOutlet().name} onEdit={this.handleToggleEdit} onDelete={this.handleDelete} onStateChange={this.handleUpdate} />
          : <EquipmentForm equipment={this.props.equipment} outlets={this.props.outlets} actionLabel={i18next.t('save')} onSubmit={this.handleSubmit} onUpdate={this.handleUpdate} onDelete={this.handleDelete} />}
      </li>
    )
  }
}
