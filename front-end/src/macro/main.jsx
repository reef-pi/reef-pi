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
import EmptyState from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
import MacroForm from './macro_form'
import { confirm } from 'utils/confirm'
import { SortByName } from 'utils/sort_by_name'
import i18n from 'utils/i18n'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { List, ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'

export class RawMacroMain extends React.Component {
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
    this.setState({ timer })
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
      this.props.macros.slice().sort((a, b) => SortByName(a, b))
        .map(macro => {
          const buttons = []
          buttons.push(
            <Button
              type='button'
              name={'run-macro-' + macro.id}
              variant='secondary'
              style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem', marginLeft: 'auto' }}
              disabled={macro.enable}
              onClick={(e) => this.runMacro(e, macro)}
              key='run'
            >
              {macro.enable ? i18n.t('macro:running') : i18n.t('macro:run')}
            </Button>
          )
          if (macro.reversible) {
            buttons.push(
              <Button
                type='button'
                name={'reverse-macro-' + macro.id}
                variant='secondary'
                style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem', marginLeft: 'auto' }}
                disabled={macro.enable}
                onClick={(e) => this.revertMacro(e, macro)}
                key='revert'
              >
                {macro.enable ? i18n.t('macro:reverting') : i18n.t('macro:revert')}
              </Button>
            )
          }

          return (
            <Collapsible
              key={'panel-macro-' + macro.id}
              name={'panel-macro-' + macro.id}
              item={macro}
              buttons={buttons}
              title={<b style={{ marginLeft: 'var(--reefpi-space-xs)', verticalAlign: 'middle' }}>{macro.name}</b>}
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
        <p>
          {i18n.t('macro:warn_delete', { name: macro.name })}
        </p>
      </div>
    )
    confirm(i18n.t('macro:title_delete', { name: macro.name }), { description: message }).then(
      function () {
        this.props.delete(macro.id)
      }.bind(this)
    )
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

    if (this.props.macros.length === 0 && !this.state.addMacro) {
      return (
        <EmptyState
          title='No macros yet'
          body='Create a macro to run multiple equipment actions in sequence.'
          action={{ label: 'Add macro', onClick: this.handleToggleAddMacroDiv, testId: 'smoke-macro-add-toggle' }}
        />
      )
    }

    return (
      <List>
        <CollapsibleList>
          {this.macroList()}
        </CollapsibleList>
        <ListItem>
          <Button
            type='button'
            variant='primary'
            id='add_macro'
            data-testid='smoke-macro-add-toggle'
            onClick={this.handleToggleAddMacroDiv}
          >
            {this.state.addMacro ? '-' : '+'}
          </Button>
          {newMacro}
        </ListItem>
      </List>
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
)(RawMacroMain)
export default Main
