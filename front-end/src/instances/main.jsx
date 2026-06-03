import React from 'react'
import Instance from './instance'
import { updateInstance, fetchInstances, createInstance, deleteInstance } from 'redux/actions/instances'
import { connect } from 'react-redux'
import InstanceForm from './instance_form'
import i18next from 'i18next'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { List, ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'

export class RawInstancesMain extends React.Component {
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
      <List>
        {this.props.instances.slice().sort((a, b) => parseInt(b.id) - parseInt(a.id)).map(item => {
          return (
            <Instance
              key={item.id}
              instance={item}
              update={this.props.update}
              delete={this.props.delete}
            />
          )
        })}
        <ListItem>
          <div>
            <Button id='add_instance' onClick={this.handleToggle}>
              {this.state.add ? '-' : '+'}
            </Button>
          </div>
          {nEq}
        </ListItem>
      </List>
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
)(RawInstancesMain)
export default Main
