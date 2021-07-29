import React from 'react'
import {
  revertMacro,
  runMacro,
  fetchMacros,
  createMacro,
  updateMacro,
  deleteMacro
} from 'redux/actions/macro'
import { connect } from 'react-redux'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import MacroForm from './macro_form'
import { confirm } from 'utils/confirm'
import { SortByName } from 'utils/sort_by_name'
import i18next from 'i18next'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addMacro: false
    }
    this.macroList = this.macroList.bind(this)
    this.handleToggleAddMacroDiv = this.handleToggleAddMacroDiv.bind(this)
    this.handleDeleteMacro = this.handleDeleteMacro.bind(this)
    this.handleCreateMacro = this.handleCreateMacro.bind(this)
    this.handleUpdateMacro = this.handleUpdateMacro.bind(this)
    this.runMacro = this.runMacro.bind(this)
    this.revertMacro = this.revertMacro.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
    // TODO: [ML] Consider Server Events, Long Polling, or Web Sockets after 2.0
    // Polling for macro status.
    const timer = window.setInterval(this.props.fetch, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  handleToggleAddMacroDiv () {
    this.setState({
      addMacro: !this.state.addMacro
    })
  }

  macroList () {
    return (
      this.props.macros.sort((a, b) => SortByName(a, b))
        .map(macro => {
          const buttons = []
          buttons.push(
            <button
              type='button' name={'run-macro-' + macro.id}
              className='btn btn-sm btn-outline-info float-right'
              disabled={macro.enable}
              onClick={(e) => this.runMacro(e, macro)}
              key='run'
            >
              {macro.enable ? i18next.t('macro:running') : i18next.t('macro:run')}
            </button>
          )
          if (macro.reversible) {
            buttons.push(
              <button
                type='button' name={'reverse-macro-' + macro.id}
                className='btn btn-sm btn-outline-info float-right'
                disabled={macro.enable}
                onClick={(e) => this.revertMacro(e, macro)}
                key='revert'
              >
                {macro.enable ? i18next.t('macro:reverting') : i18next.t('macro:revert')}
              </button>
            )
          }

          return (
            <Collapsible
              key={'panel-macro-' + macro.id}
              name={'panel-macro-' + macro.id}
              item={macro}
              buttons={buttons}
              title={<b className='ml-2 align-middle'>{macro.name} </b>}
              onDelete={this.handleDeleteMacro}
            >
              <MacroForm
                onSubmit={this.handleUpdateMacro}
                macro={macro}
              />
            </Collapsible>
          )
        })
    )
  }

  valuesToMacro (values) {
    const macro = {
      name: values.name,
      enable: values.enable,
      reversible: values.reversible,
      steps: values.steps.map(step => {
        return {
          type: step.type,
          config: {
            duration: step.duration,
            title: step.title,
            message: step.message,
            on: step.on,
            id: step.id
          }
        }
      })
    }
    return macro
  }

  handleUpdateMacro (values) {
    const payload = this.valuesToMacro(values)
    this.props.update(values.id, payload)
  }

  handleCreateMacro (values) {
    const payload = this.valuesToMacro(values)
    this.props.create(payload)
    this.handleToggleAddMacroDiv()
  }

  handleDeleteMacro (macro) {
    const message = (
      <div>
        <p>This action will delete {macro.name}.</p>
      </div>
    )

    confirm('Delete ' + macro.name, { description: message })
      .then(function () {
        this.props.delete(macro.id)
      }.bind(this))
  }

  runMacro (e, macro) {
    e.stopPropagation()
    this.props.run(macro.id)
    this.props.fetch()
  }

  revertMacro (e, macro) {
    e.stopPropagation()
    this.props.revert(macro.id)
    this.props.fetch()
  }

  render () {
    let newMacro = null
    if (this.state.addMacro) {
      newMacro = <MacroForm onSubmit={this.handleCreateMacro} />
    }

    return (
      <ul className='list-group list-group-flush'>
        <CollapsibleList>
          {this.macroList()}
        </CollapsibleList>
        <li className='list-group-item add-macro'>
          <div className='row'>
            <div className='col'>
              <input
                type='button'
                id='add_macro'
                value={this.state.addMacro ? '-' : '+'}
                onClick={this.handleToggleAddMacroDiv}
                className='btn btn-outline-success'
              />
            </div>
          </div>
          {newMacro}
        </li>
      </ul>
    )
  }
}

const mapStateToProps = state => {
  return {
    macros: state.macros
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchMacros()),
    create: a => dispatch(createMacro(a)),
    update: (id, m) => dispatch(updateMacro(id, m)),
    delete: id => dispatch(deleteMacro(id)),
    run: id => dispatch(runMacro(id)),
    revert: id => dispatch(revertMacro(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
