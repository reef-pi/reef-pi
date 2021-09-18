import React from 'react'
import { createJournal } from 'redux/actions/journal'
import JournalForm from './form'
import { connect } from 'react-redux'

class newJournal extends React.Component {
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
      name: '543',
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
      <div className='list-group-item add-journal'>
        <input id='add_new_journal' type='button' value={this.state.add ? '-' : '+'} onClick={this.handleToggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createJournal: (a) => dispatch(createJournal(a))
  }
}

const New = connect(null, mapDispatchToProps)(newJournal)
export default New
