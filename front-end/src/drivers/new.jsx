import React from 'react'
import DriverForm from './driver_form'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

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
        <Button
          id='add_new_driver'
          data-testid='smoke-driver-add-toggle'
          variant='secondary'
          style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          onClick={this.handleToggle}
        >{this.state.add ? '-' : '+'}
        </Button>
        {this.ui()}
      </div>
    )
  }
}
