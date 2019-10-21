import React from 'react'
import TemperatureForm from './temperature_form'

export default class New extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
    this.handleAdd = this.handleAdd.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.ui = this.ui.bind(this)
  }

  handleToggle () {
    this.setState({
      expanded: !this.state.expanded
    })
  }

  ui () {
    if (!this.state.expanded) {
      return
    }
    return (
      <TemperatureForm
        sensors={this.props.sensors}
        equipment={this.props.equipment}
        macros={this.props.macros}
        onSubmit={this.handleAdd}
      />
    )
  }

  handleAdd (values) {
    const payload = {
      name: values.name,
      enable: values.enable,
      control: (values.control === 'macro' || values.control === 'equipment'),
      is_macro: (values.control === 'macro'),
      heater: values.heater,
      cooler: values.cooler,
      min: parseFloat(values.min),
      max: parseFloat(values.max),
      sensor: values.sensor,
      period: parseInt(values.period),
      fahrenheit: values.fahrenheit,
      notify: {
        enable: values.alerts,
        min: parseFloat(values.minAlert),
        max: parseFloat(values.maxAlert)
      }
    }
    this.props.create(payload)
    this.handleToggle()
  }

  render () {
    return (
      <li className='list-group-item add-temperature'>
        <div className='row'>
          <div className='col'>
            <input
              id='add_tc' type='button'
              value={this.state.expanded ? '-' : '+'}
              onClick={this.handleToggle}
              className='btn btn-outline-success'
            />
            {this.ui()}
          </div>
        </div>
      </li>
    )
  }
}
