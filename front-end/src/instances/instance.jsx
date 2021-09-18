import React from 'react'
import ViewInstance from './view_instance'
import InstanceForm from './instance_form'
import { confirm } from 'utils/confirm'
import i18n from 'utils/i18n'

export default class Instance extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      readOnly: true
    }

    this.toggleEdit = this.toggleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  handleToggleEdit (e) {
    e.stopPropagation()
    this.setState({ readOnly: false })
  }

  handleSubmit (values) {
    const id = values.id

    const payload = {
      name: values.name,
      address: values.address,
      user: 'reef-pi',
      password: 'reef-pi'
    }

    this.props.update(id, payload).then(() => {
      this.setState({ readOnly: true })
    })
  }

  handleDelete (e) {
    e.stopPropagation()
    const message = (
      <div>
        <p>{i18n.t('instance:warn_delete').replace('$[name]', this.props.instance.name)}.</p>
      </div>
    )

    confirm(i18n.t('instance:title_delete').replace('$[name]', this.props.instance.name), { description: message }).then(
      function () {
        this.props.delete(this.props.instance.id)
      }.bind(this)
    )
  }

  handleUpdate () {
    this.props.update()
  }

  render () {
    return (
      <li className='list-group-item'>
        {this.state.readOnly === true
          ? <ViewInstance instance={this.props.instance} onEdit={this.handleToggleEdit} onDelete={this.handleDelete} onStateChange={this.handleUpdate} />
          : <InstanceForm instance={this.props.instance} actionLabel='Save' onSubmit={this.handleSubmit} onUpdate={this.handleUpdate} onDelete={this.handleDelete} />}
      </li>
    )
  }
}
