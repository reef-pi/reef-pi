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
import AddToggle from '../ui_components/add_toggle'
import MacroSummary from './macro_summary'

const isTrue = value => value === true || value === 'true'

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
          const active = isTrue(macro.enable)
          const buttons = []
          buttons.push(
            <Button
              type='button'
              name={'run-macro-' + macro.id}
              data-testid={'smoke-macro-run-' + macro.id}
              variant='secondary'
              style={{ marginLeft: 'auto' }}
              disabled={active}
              onClick={(e) => this.runMacro(e, macro)}
              key='run'
            >
              {active ? i18n.t('macro:running') : i18n.t('macro:run')}
            </Button>
          )
          if (macro.reversible) {
            buttons.push(
              <Button
                type='button'
                name={'reverse-macro-' + macro.id}
                variant='secondary'
                style={{ marginLeft: 'auto' }}
                disabled={active}
                onClick={(e) => this.revertMacro(e, macro)}
                key='revert'
              >
                {active ? i18n.t('macro:reverting') : i18n.t('macro:revert')}
              </Button>
            )
          }

          return (
            <Collapsible
              key={'panel-macro-' + macro.id}
              name={'panel-macro-' + macro.id}
              item={macro}
              buttons={buttons}
              title={(
                <span className='reefpi-controller-title'>
                  <span>{macro.name}</span>
                  <span className='reefpi-controller-title__state'>{i18n.t(active ? 'enabled' : 'disabled')}</span>
                </span>
              )}
              onDelete={this.handleDeleteMacro}
              separateEdit
              overflowActions
              actionsLabel={i18n.t('macro:actions', { name: macro.name, defaultValue: `Actions for ${macro.name}` })}
            >
              <MacroSummary
                macro={macro}
                equipment={this.props.equipment}
                timers={this.props.timers}
                atos={this.props.atos}
                tcs={this.props.tcs}
                phprobes={this.props.phprobes}
                dosers={this.props.dosers}
                macros={this.props.macros}
                lights={this.props.lights}
                jacks={this.props.jacks}
              />
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
          title={i18n.t('macro:empty_title', { defaultValue: 'No macros yet' })}
          body={i18n.t('macro:empty_body', { defaultValue: 'Create a macro to run multiple equipment actions in sequence.' })}
          action={{ label: i18n.t('macro:add_macro', { defaultValue: 'Add macro' }), onClick: this.handleToggleAddMacroDiv, testId: 'smoke-macro-add-toggle' }}
        />
      )
    }

    return (
      <List>
        <CollapsibleList>
          {this.macroList()}
        </CollapsibleList>
        <ListItem>
          <AddToggle id='add_macro' testId='smoke-macro-add-toggle' open={this.state.addMacro} onClick={this.handleToggleAddMacroDiv} />
          {newMacro}
        </ListItem>
      </List>
    )
  }
}

export const mapStateToProps = state => {
  return {
    macros: state.macros,
    equipment: state.equipment,
    timers: state.timers,
    atos: state.atos,
    tcs: state.tcs,
    phprobes: state.phprobes,
    dosers: state.dosers,
    lights: state.lights,
    jacks: state.jacks
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
