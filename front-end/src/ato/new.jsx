import React from 'react'
import { createATO } from 'redux/actions/ato'
import AtoForm from './ato_form'
import { connect } from 'react-redux'

class newATO extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      enable: false,
      inlet: '',
      period: 60,
      add: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.ui = this.ui.bind(this)
  }

  handleToggle () {
    this.setState({
      add: !this.state.add
    })
    this.setState({
      name: '',
      enable: false,
      period: 60,
      inlet: ''
    })
  }

  ui () {
    if (!this.state.add) {
      return
    }
    return (
      <AtoForm
        onSubmit={this.handleSubmit}
        inlets={this.props.inlets}
        equipment={this.props.equipment}
      />
    )
  }

  handleSubmit (values) {
    const payload = {
      name: values.name,
      enable: values.enable,
      inlet: values.inlet,
      period: parseInt(values.period),
      control: (values.pump !== ''),
      pump: values.pump,
      disable_on_alert: values.disable_on_alert,
      notify: {
        enable: values.notify,
        max: values.maxAlert
      }
    }
    this.props.createATO(payload)
    this.handleToggle()
  }

  render () {
    return (
      <div className='list-group-item add-ato'>
        <input id='add_new_ato_sensor' type='button' value={this.state.add ? '-' : '+'} onClick={this.handleToggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createATO: (a) => dispatch(createATO(a))
  }
}

const New = connect(null, mapDispatchToProps)(newATO)
export default New
