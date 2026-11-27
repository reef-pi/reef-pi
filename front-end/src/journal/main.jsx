import React from 'react'
import New from './new'
import Journal from './journal'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import EmptyState from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
import { fetchJournals, deleteJournal } from 'redux/actions/journal'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { confirm } from 'utils/confirm'
import { SortByName } from 'utils/sort_by_name'
import { List } from '../../design-system/ui_kits/reef-pi-app/primitives/List'

export class RawJournalMain extends React.Component {
  constructor (props) {
    super(props)
    this.state = { showNewJournal: false }
    this.handleDelete = this.handleDelete.bind(this)
    this.handleAddFirstJournal = this.handleAddFirstJournal.bind(this)
    this.list = this.list.bind(this)
  }

  handleAddFirstJournal () {
    this.setState({ showNewJournal: true })
  }

  handleDelete (j) {
    const message = (
      <div>
        <p>
          {i18next.t('journal:warn_delete', { name: j.name })}
        </p>
      </div>
    )
    confirm(i18next.t('journal:title_delete', { name: j.name }), { description: message }).then(
      function () {
        this.props.delete(j.id)
      }.bind(this)
    )
  }

  list () {
    return this.props.journals.slice().sort((a, b) => SortByName(a, b))
      .map(j => {
        return (
          <Collapsible
            key={'panel-journal-' + j.id}
            name={'panel-journal-' + j.id}
            item={j}
            title={<b style={{ marginLeft: 'var(--reefpi-space-xs)', verticalAlign: 'middle' }}>{j.name}</b>}
            onDelete={this.handleDelete}
          >
            <Journal config={j} />
          </Collapsible>
        )
      })
  }

  render () {
    if (this.props.journals.length === 0) {
      if (this.state.showNewJournal) {
        return <New initiallyExpanded />
      }
      return (
        <EmptyState
          testId='smoke-journal-empty'
          title={i18next.t('journal:empty_title', { defaultValue: 'No journal entries' })}
          body={i18next.t('journal:empty_body', { defaultValue: 'Log observations, parameter changes, and livestock additions.' })}
          action={{ label: i18next.t('journal:add_entry', { defaultValue: 'Add entry' }), onClick: this.handleAddFirstJournal, testId: 'smoke-journal-add-toggle' }}
        />
      )
    }

    return (
      <List data-testid='smoke-journal-list'>
        <CollapsibleList>{this.list()}</CollapsibleList>
        <New />
      </List>
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
    delete: id => dispatch(deleteJournal(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawJournalMain)
export default Main
