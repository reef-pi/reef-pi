import React from 'react'
import New from './new'
import JournalForm from './form'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import { fetchJournals, deleteJournal, updateJournal, fetchJournalUsage, recordJournal } from 'redux/actions/journal'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { confirm } from 'utils/confirm'
import { SortByName } from 'utils/sort_by_name'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleRecord = this.handleRecord.bind(this)
    this.list = this.list.bind(this)
  }

  handleRecord (values) {
    const payload = {
      value: values.value,
      comment: values.comment,
      timestamp: values.timestamp
    }
    this.props.record(values.id, payload)
  }

  handleSubmit (values) {
    const payload = {
      name: values.name,
      description: values.description,
      unit: values.unit
    }
    this.props.update(values.id, payload)
  }

  handleDelete (j) {
    const message = (
      <div>
        <p>
          {i18next.t('journal:warn_delete', {name: j.name})}
        </p>
      </div>
    )
    confirm(i18next.t('delete'), { description: message }).then(
      function () {
        this.props.delete(j.id)
      }.bind(this)
    )
  }

  list () {
    return this.props.journals.sort((a, b) => SortByName(a, b))
      .map(j => {
        return (
          <Collapsible
            key={'panel-journal-' + j.id}
            name={'panel-journal-' + j.id}
            item={j}
            title={<b className='ml-2 align-middle'>{j.name} </b>}
            onDelete={this.handleDelete}
          >
            <JournalForm
              data={j}
              onSubmit={this.handleSubmit}
              onRecord={this.handleRecord}
              fetchEntries={this.props.fetchEntries}
            />
          </Collapsible>
        )
      })
  }

  render () {
    return (
      <div>
        <ul className='list-group list-group-flush'>
          <CollapsibleList>{this.list()}</CollapsibleList>
          <New />
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    journals: state.journals
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchJournals: () => dispatch(fetchJournals()),
    delete: id => dispatch(deleteJournal(id)),
    update: (id, a) => dispatch(updateJournal(id, a)),
    record: (id, a) => dispatch(recordJournal(id, a)),
    fetchEntries: (id) => dispatch(fetchJournalUsage(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
