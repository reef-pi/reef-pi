import React from 'react'
import ViewEquipment from './view_equipment'
import EquipmentForm from './equipment_form'
import {confirm} from 'utils/confirm'

export default class Equipment extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      readOnly: true
    }

    this.toggleEdit = this.toggleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  selectedOutlet () {
    for (let i = 0; i < this.props.outlets.length; i++) {
      if (this.props.outlets[i].id === this.props.equipment.outlet) return this.props.outlets[i]
    }
    return {name: ''}
  }

  toggleEdit (e) {
    e.stopPropagation()
    this.setState({readOnly: false})
  }

  onSubmit (values) {
    const id = values.id

    const payload = {
      name: values.name,
      outlet: values.outlet,
      on: values.on
    }

    this.props.update(id, payload).then(() => {
      this.setState({readOnly: true})
    })
  }

  handleDelete (e) {
    e.stopPropagation()
    const message = (
      <div>
        <p>This action will delete {this.props.equipment.name}.</p>
      </div>
    )

    confirm('Delete ' + this.props.equipment.name, {description: message})
      .then(function () {
        this.props.delete(this.props.equipment.id)
      }.bind(this))
  }

  render () {

    return (
      <li className='list-group-item'>
        {this.state.readOnly === true
          ? <ViewEquipment equipment={this.props.equipment}
            outletName={this.selectedOutlet().name}
            onEdit={this.toggleEdit}
            onDelete={this.handleDelete}
            onStateChange={this.props.update} />
          : <EquipmentForm equipment={this.props.equipment}
            outlets={this.props.outlets}
            actionLabel='Save'
            onSubmit={this.onSubmit}
            onUpdate={this.props.update}
            onDelete={this.handleDelete} />
        }
      </li>
    )
  }
}
