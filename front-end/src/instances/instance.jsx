import React from 'react'
import ViewInstance from './view_instance'
import InstanceForm from './instance_form'
import {confirm} from 'utils/confirm'

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

  toggleEdit (e) {
    e.stopPropagation()
    this.setState({readOnly: false})
  }

  onSubmit (values) {
    const id = values.id

    const payload = {
      name: values.name,
      address: values.address,
      user: 'reef-pi',
      password: 'reef-pi'
    }

    this.props.update(id, payload).then(() => {
      this.setState({readOnly: true})
    })
  }

  handleDelete (e) {
    e.stopPropagation()
    const message = (
      <div>
        <p>This action will delete {this.props.instance.name}.</p>
      </div>
    )

    confirm('Delete ' + this.props.instance.name, {description: message})
      .then(function () {
        this.props.delete(this.props.instance.id)
      }.bind(this))
  }

  render () {
    return (
      <li className='list-group-item'>
        {this.state.readOnly === true
          ? <ViewInstance instance={this.props.instance}
            onEdit={this.toggleEdit}
            onDelete={this.handleDelete}
            onStateChange={this.props.update} />
          : <InstanceForm instance={this.props.instance}
            actionLabel='Save'
            onSubmit={this.onSubmit}
            onUpdate={this.props.update}
            onDelete={this.handleDelete} />
        }
      </li>
    )
  }
}
