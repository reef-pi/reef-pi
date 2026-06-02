import React from 'react'
import { createATO } from 'redux/actions/ato'
import AtoForm from './ato_form'
import { connect } from 'react-redux'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'

export class RawNewATO extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      enable: false,
      inlet: '',
      period: 60,
      add: !!props.initialAdd
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
        macros={this.props.macros}
      />
    )
  }

  handleSubmit (values) {
    const payload = {
      name: values.name,
      enable: values.enable,
      inlet: values.inlet,
      period: parseInt(values.period),
      control: (values.control === 'macro' || values.control === 'equipment'),
      pump: values.pump,
      disable_on_alert: values.disable_on_alert,
      notify: {
        enable: values.notify,
        max: values.maxAlert
      },
      is_macro: values.control === 'macro',
      one_shot: values.one_shot
    }
    this.props.createATO(payload)
    this.handleToggle()
  }

  render () {
    return (
      <ListItem>
        <Button
          id='add_new_ato_sensor'
          data-testid='smoke-ato-add-toggle'
          type='button'
          variant='primary'
          onClick={this.handleToggle}
        >
          {this.state.add ? '-' : '+'}
        </Button>
        {this.ui()}
      </ListItem>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createATO: (a) => dispatch(createATO(a))
  }
}

const New = connect(null, mapDispatchToProps)(RawNewATO)
export default New
