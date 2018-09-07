import React from 'react'
import TemperatureForm from './temperature_form'

export default class New extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      expanded: false
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.ui = this.ui.bind(this)
  }

  toggle () {
    this.setState({
      expanded: !this.state.expanded
    })
  }

  ui () {
    if (!this.state.expanded) {
      return
    }
    return (
      <TemperatureForm sensors={this.props.sensors} equipment={this.props.equipment} onSubmit={this.add}/>
    )
  }

  add (values) {
    var payload = {
      name: values.name,
      enable: values.enabled,
      control: (values.heater != '' || values.cooler != ''),
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
      },
      chart_min: parseFloat(values.chart_min),
      chart_max: parseFloat(values.chart_max)
    }
    this.props.create(payload)
    this.toggle()
  }

  render () {
    return (
      <li className='list-group-item add-temperature'>
        <div className='row'>
          <div className='col'>
            <input id='add_tc' type='button' 
              value={this.state.expanded ? '-' : '+'} 
              onClick={this.toggle} 
              className='btn btn-outline-success' />
            {this.ui()}
          </div>
        </div>
      </li>
    )
  }
}
