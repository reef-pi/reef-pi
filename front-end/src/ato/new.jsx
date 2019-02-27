import React from 'react'
import {createATO} from 'redux/actions/ato'
import AtoForm from './ato_form'
import {connect} from 'react-redux'

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
      <AtoForm onSubmit={this.add}
        inlets={this.props.inlets}
        equipment={this.props.equipment} />
    )
  }

  add (values) {
    var payload = {
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
    this.toggle()
  }

  render () {
    return (
      <div className='list-group-item add-ato'>
        <input id='add_new_ato_sensor' type='button' value={this.state.add ? '-' : '+'} onClick={this.toggle} className='btn btn-outline-success' />
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
