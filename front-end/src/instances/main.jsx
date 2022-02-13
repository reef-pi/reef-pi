import React from 'react'
import Instance from './instance'
import { updateInstance, fetchInstances, createInstance, deleteInstance } from 'redux/actions/instances'
import { connect } from 'react-redux'
import InstanceForm from './instance_form'
import i18next from 'i18next'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }

    this.handleCreate = this.handleCreate.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  handleCreate (values) {
    const payload = {
      name: values.name,
      address: values.address,
      user: values.user,
      password: values.password,
      ignore_https: values.ignore_https
    }
    this.props.create(payload)
    this.toggle()
  }

  handleToggle () {
    this.setState({
      add: !this.state.add
    })
  }

  render () {
    let nEq = <div />
    if (this.state.add) {
      nEq = <InstanceForm onSubmit={this.handleCreate} actionLabel={i18next.t('save')} />
    }
    return (
      <ul className='list-group list-group-flush'>
        {this.props.instances.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) }).map(item => {
          return (
            <Instance
              key={item.id}
              instance={item}
              update={this.props.update}
              delete={this.props.delete}
            />
          )
        })}
        <li className='list-group-item add-instance'>
          <div className='row'>
            <div className='col'>
              <input
                id='add_instance'
                type='button'
                value={this.state.add ? '-' : '+'}
                onClick={this.handleToggle}
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
    instances: state.instances
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchInstances()),
    create: e => dispatch(createInstance(e)),
    update: (id, e) => dispatch(updateInstance(id, e)),
    delete: id => dispatch(deleteInstance(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
