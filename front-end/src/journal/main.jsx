import React from 'react'
import New from './new'
import Journal from './journal'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import { fetchJournals, deleteJournal } from 'redux/actions/journal'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { confirm } from 'utils/confirm'
import { SortByName } from 'utils/sort_by_name'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.handleDelete = this.handleDelete.bind(this)
    this.list = this.list.bind(this)
  }

  handleDelete (j) {
    const message = (
      <div>
        <p>
          {i18next.t('journal:warn_delete', { name: j.name })}
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
            <Journal config={j} />
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
    delete: id => dispatch(deleteJournal(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
