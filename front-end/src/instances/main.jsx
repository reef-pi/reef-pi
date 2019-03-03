import React from 'react'
import Instance from './instance'
import { updateInstance, fetchInstance, createInstance, deleteInstance } from 'redux/actions/instances'
import { connect } from 'react-redux'
import InstanceForm from './instance_form'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }

    this.create = this.create.bind(this)
    this.toggle = this.toggle.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  createt (values) {
    var payload = {
      name: values.name
    }
    this.props.create(payload)
    this.toggle()
  }

  toggleAddEquipmentDiv () {
    this.setState({
      add: !this.state.add
    })
  }

  render () {
    var nEq = <div />
    if (this.state.add) {
      nEq = <InstanceForm onSubmit={this.create} />
    }
    return (
      <ul className='list-group list-group-flush'>
        {this.props.instances.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) }).map(item => {
          return (
            <Instance
              key={item.id}
              data={item}
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
                onClick={this.toggle}
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
    fetch: () => dispatch(fetchInstance()),
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
