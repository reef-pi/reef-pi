import React from 'react'
import DriverForm from './driver_form'
import AddToggle from '../ui_components/add_toggle'

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
      return (<DriverForm onSubmit={this.handleAdd} driverOptions={this.props.driverOptions} />)
    }
  }

  handleAdd (values, { setErrors }) {
    const payload = {
      name: values.name,
      type: values.type,
      config: values.config
    }
    const hook = this.props.hook
    const handleToggle = this.handleToggle
    this.props.validate(payload)
      .then(response => {
        if (response.status === 400) {
          response.json().then(data => {
            const config = {}
            Object.keys(data).forEach(item => {
              if (item.startsWith('config.')) {
                config[item.replace('config.', '')] = data[item]
              }
            })
            data.config = config
            setErrors(data)
          })
        } else {
          hook(payload)
          handleToggle()
        }
      })
  }

  render () {
    return (
      <div className='add-driver'>
        <AddToggle id='add_new_driver' testId='smoke-driver-add-toggle' open={this.state.add} onClick={this.handleToggle} />
        {this.ui()}
      </div>
    )
  }
}
