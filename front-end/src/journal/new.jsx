import React from 'react'
import { createJournal } from 'redux/actions/journal'
import JournalForm from './form'
import { connect } from 'react-redux'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'

export class RawNewJournal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      description: '',
      unit: '',
      add: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.ui = this.ui.bind(this)
  }

  handleToggle () {
    this.setState({
      add: !this.state.add,
      name: '',
      description: '',
      unit: ''
    })
  }

  ui () {
    if (!this.state.add) {
      return
    }
    return (
      <JournalForm
        onSubmit={this.handleSubmit}
      />
    )
  }

  handleSubmit (values) {
    const payload = {
      name: values.name,
      description: values.description,
      unit: values.unit
    }
    this.props.createJournal(payload)
    this.handleToggle()
  }

  render () {
    return (
      <ListItem>
        <Button id='add_new_journal' type='button' variant='primary' onClick={this.handleToggle}>
          {this.state.add ? '-' : '+'}
        </Button>
        {this.ui()}
      </ListItem>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createJournal: (a) => dispatch(createJournal(a))
  }
}

const New = connect(null, mapDispatchToProps)(RawNewJournal)
export default New
