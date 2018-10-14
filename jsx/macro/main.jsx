import React from 'react'
import { runMacro, fetchMacros, createMacro, updateMacro, deleteMacro } from 'redux/actions/macro'
import { connect } from 'react-redux'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import MacroForm from './macro_form'
import { confirm } from 'utils/confirm'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addMacro: false
    }
    this.macroList = this.macroList.bind(this)
    this.toggleAddMacroDiv = this.toggleAddMacroDiv.bind(this)
    this.deleteMacro = this.deleteMacro.bind(this)
    this.createMacro = this.createMacro.bind(this)
    this.updateMacro = this.updateMacro.bind(this)
    this.runMacro = this.runMacro.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
    // TODO: [ML] Consider Server Events, Long Polling, or Web Sockets after 2.0
    // Polling for macro status.
    var timer = window.setInterval(this.props.fetch, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  toggleAddMacroDiv () {
    this.setState({
      addMacro: !this.state.addMacro
    })
  }

  macroList () {
    return (
      this.props.macros.map(macro => {
        const runButton = (
          <button type='button' name={'run-macro-' + macro.id}
            className='btn btn-sm btn-outline-info float-right'
            disabled={macro.enable}
            onClick={(e) => this.runMacro(e, macro)}>
            { macro.enable ? 'Running' : 'Run' }
          </button>
        )

        return (
          <Collapsible key={'panel-macro-' + macro.id}
            name={'panel-macro-' + macro.id}
            item={macro}
            buttons={runButton}
            title={<b className='ml-2 align-middle'>{macro.name} </b>}
            onDelete={this.deleteMacro}>
            <MacroForm onSubmit={this.updateMacro}
              macro={macro} />
          </Collapsible>
        )
      })
    )
  }

  valuesToMacro (values) {
    var macro = {
      name: values.name,
      enable: values.enable,
      steps: values.steps.map(step => {
        return {
          type: step.type,
          config: {
            duration: step.duration,
            on: step.on,
            id: step.id
          }
        }
      })
    }
    return macro
  }

  updateMacro (values) {
    var payload = this.valuesToMacro(values)

    this.props.update(values.id, payload)
  }

  createMacro (values) {
    var payload = this.valuesToMacro(values)

    this.props.create(payload)
    this.toggleAddMacroDiv()
  }

  deleteMacro (macro) {
    const message = (
      <div>
        <p>This action will delete {macro.name}.</p>
      </div>
    )

    confirm('Delete ' + macro.name, {description: message})
      .then(function () {
        this.props.delete(macro.id)
      }.bind(this))
  }

  runMacro (e, macro) {
    e.stopPropagation()
    this.props.run(macro.id)
    this.props.fetch()
  }

  render () {
    let newMacro = null
    if (this.state.addMacro) {
      newMacro = <MacroForm onSubmit={this.createMacro} />
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
                onClick={this.toggleAddMacroDiv}
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
    run: id => dispatch(runMacro(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
