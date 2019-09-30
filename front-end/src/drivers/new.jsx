import React from 'react'
import DriverForm from './driver_form'
import { i2cDrivers } from './types'

export default class New extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      type: '',
      config: {},
      add: false
    }
    this.handleAdd = this.handleAdd.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.ui = this.ui.bind(this)
  }

  handleToggle () {
    this.setState({
      add: !this.state.add
    })
    this.setState({
      name: '',
      type: '',
      config: {}
    })
  }

  ui () {
    if (this.state.add) {
      return (<DriverForm onSubmit={this.handleAdd} />)
    }
  }

  handleAdd (values) {
    const payload = {
      name: values.name,
      type: values.type,
      config: values.config
    }
    if (i2cDrivers.includes(payload.type)) {
      payload.config.address = parseInt(payload.config.address)
    }
    payload.config.frequency = parseInt(payload.config.frequency)
    this.props.hook(payload)
    this.toggle()
  }

  render () {
    return (
      <div className='container add-driver'>
        <input id='add_new_driver' type='button' value={this.state.add ? '-' : '+'} onClick={this.handleToggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}
