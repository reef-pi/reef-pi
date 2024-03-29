import React from 'react'
import New from './new'
import AtoForm from './ato_form'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import { fetchATOs, deleteATO, updateATO, resetATO } from 'redux/actions/ato'
import { connect } from 'react-redux'
import { fetchEquipment } from 'redux/actions/equipment'
import { fetchInlets } from 'redux/actions/inlets'
import i18n from 'utils/i18n'
import { confirm } from 'utils/confirm'
import { SortByName } from 'utils/sort_by_name'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.probeList = this.probeList.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleReset = this.handleReset.bind(this)
  }

  componentDidMount () {
    this.props.fetchATOs()
    this.props.fetchEquipment()
    this.props.fetchInlets()
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
      one_shot: values.one_shot,
      notify: {
        enable: values.notify,
        max: values.maxAlert
      },
      is_macro: (values.control === 'macro')
    }
    this.props.update(values.id, payload)
  }

  handleReset (probe) {
    const message = (
      <div>
        <p>
          {i18n.t('ato:warn_reset', { name: probe.name })}
        </p>
      </div>
    )
    confirm(i18n.t('ato:reset_usage'), { description: message }).then(
      function () {
        this.props.reset(probe.id)
      }.bind(this)
    )
  }

  handleDelete (probe) {
    const message = (
      <div>
        <p>
          {i18n.t('ato:warn_delete', { name: probe.name })}
        </p>
      </div>
    )
    confirm(i18n.t('ato:title_delete', { name: probe.name }), { description: message }).then(
      function () {
        this.props.delete(probe.id)
      }.bind(this)
    )
  }

  probeList () {
    return this.props.atos.sort((a, b) => SortByName(a, b))
      .map(probe => {
        const handleToggleState = () => {
          probe.enable = !probe.enable
          this.props.update(probe.id, probe)
        }
        const resetButton = (
          <button
            type='button'
            name={'reset-ato-' + probe.id}
            className='btn btn-sm btn-outline-info float-right'
            onClick={() => { this.handleReset(probe) }}
          >
            {i18n.t('ato:reset_usage')}
          </button>
        )
        return (
          <Collapsible
            key={'panel-ato-' + probe.id}
            name={'panel-ato-' + probe.id}
            item={probe}
            title={<b className='ml-2 align-middle'>{probe.name} </b>}
            onDelete={this.handleDelete}
            onToggleState={handleToggleState}
            enabled={probe.enable}
            buttons={resetButton}
          >
            <AtoForm
              data={probe}
              onSubmit={this.handleSubmit}
              inlets={this.props.inlets}
              equipment={this.props.equipment}
              macros={this.props.macros}
            />

          </Collapsible>
        )
      })
  }

  render () {
    return (
      <div>
        <ul className='list-group list-group-flush'>
          <CollapsibleList>{this.probeList()}</CollapsibleList>
          <New
            inlets={this.props.inlets}
            equipment={this.props.equipment}
            macros={this.props.macros}
          />
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    atos: state.atos,
    equipment: state.equipment,
    inlets: state.inlets,
    macros: state.macros
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchATOs: () => dispatch(fetchATOs()),
    fetchEquipment: () => dispatch(fetchEquipment()),
    fetchInlets: () => dispatch(fetchInlets()),
    delete: id => dispatch(deleteATO(id)),
    update: (id, a) => dispatch(updateATO(id, a)),
    reset: (id) => dispatch(resetATO(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
