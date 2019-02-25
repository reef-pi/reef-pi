import React from 'react'
import DriverForm from './driver_form'

export default class New extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      type: '',
      config: {},
      add: false
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.ui = this.ui.bind(this)
  }

  toggle () {
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
      return (<DriverForm onSubmit={this.add} />)
    }
  }

  add (values) {
    var payload = {
      name: values.name,
      type: values.type,
      config: values.config
    }
    payload.config.address = parseInt(payload.config.address)
    payload.config.frequency = parseInt(payload.config.frequency)
    this.props.hook(payload)
    this.toggle()
  }

  render () {
    return (
      <div className='container add-driver'>
        <input id='add_new_driver' type='button' value={this.state.add ? '-' : '+'} onClick={this.toggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}
