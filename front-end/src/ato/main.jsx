import React, { useState } from 'react'
import New from './new'
import AtoForm from './ato_form'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import EmptyState from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
import { fetchATOs, fetchATOUsage, deleteATO, updateATO, resetATO } from 'redux/actions/ato'
import { connect } from 'react-redux'
import { fetchEquipment } from 'redux/actions/equipment'
import { fetchInlets } from 'redux/actions/inlets'
import i18n from 'utils/i18n'
import { confirm } from 'utils/confirm'
import { SortByName } from 'utils/sort_by_name'
import { timestampToEpoch } from 'utils/timestamp'
import RangeSelector from '../../design-system/ui_kits/reef-pi-app/primitives/RangeSelector'
import Sparkline from '../../design-system/ui_kits/reef-pi-app/primitives/Sparkline'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { List } from '../../design-system/ui_kits/reef-pi-app/primitives/List'
import ControllerSummary from '../ui_components/controller_summary'

const RANGE_MS = { '1h': 3600000, '6h': 21600000, '1d': 86400000, '7d': 604800000, '30d': 2592000000 }

function AtoPrimitives ({ ato, usage }) {
  const [range, setRange] = useState('1d')

  const cutoff = Date.now() - (RANGE_MS[range] || RANGE_MS['1d'])
  const points = ((usage && usage.historical) || [])
    .filter(d => timestampToEpoch(d.time) >= cutoff)
    .map(d => ({ t: timestampToEpoch(d.time), v: d.pump }))
    .sort((a, b) => a.t - b.t)

  return (
    <div style={{ padding: 'var(--reefpi-space-xs) 0' }}>
      <RangeSelector value={range} onChange={setRange} compact scope={`ato-${ato.id}`} />
      {points.length > 0
        ? (
          <div style={{ marginTop: 'var(--reefpi-space-xs)' }}>
            <Sparkline
              points={points}
              stroke='var(--reefpi-color-brand)'
              fill='var(--reefpi-color-brand)'
              height={56}
              hover
            />
          </div>
          )
        : <p className='reefpi-controller-empty'>{i18n.t('ato:empty_usage', { defaultValue: 'No top-off usage yet. Usage appears after reef-pi commands the configured target.' })}</p>}
    </div>
  )
}

const enabledLabel = value => i18n.t(value ? 'enabled' : 'disabled')

const namedTarget = (id, items = []) => {
  if (!id) return i18n.t('not_configured', { defaultValue: 'Not configured' })
  if (typeof id === 'object') return id.name || id.id || i18n.t('configured', { defaultValue: 'Configured' })
  return items.find(item => item.id === id)?.name || id
}

export function AtoSummary ({ ato, usage, inlets, equipment, macros }) {
  const targets = ato.is_macro ? macros : equipment
  const control = ato.control
    ? (ato.is_macro ? i18n.t('ato:controlmacro') : i18n.t('ato:controlequipment'))
    : i18n.t('ato:no_automatic_control', { defaultValue: 'No automatic control' })
  const alert = ato.notify && ato.notify.enable
    ? i18n.t('ato:alert_summary', { seconds: ato.notify.max, defaultValue: `After ${ato.notify.max} s pump-on time` })
    : i18n.t('disabled')

  return (
    <ControllerSummary
      sections={[
        {
          title: i18n.t('ato:sensor_timing', { defaultValue: 'Sensor & timing' }),
          items: [
            { label: i18n.t('inlet'), value: namedTarget(ato.inlet, inlets) },
            { label: i18n.t('ato:chk_freq'), value: ato.period ? `${ato.period} s` : undefined },
            { label: i18n.t('ato:debounce'), value: `${ato.debounce || 0} s` }
          ]
        },
        {
          title: i18n.t('ato:pump_control', { defaultValue: 'Pump control' }),
          items: [
            { label: i18n.t('ato:control'), value: control },
            { label: i18n.t('ato:control_target'), value: namedTarget(ato.pump, targets) },
            { label: i18n.t('one_shot'), value: enabledLabel(ato.one_shot) }
          ]
        },
        {
          title: i18n.t('ato:safety_alerts', { defaultValue: 'Safety & alerts' }),
          items: [
            { label: i18n.t('alerts'), value: alert },
            { label: i18n.t('ato:disable_on_alert'), value: enabledLabel(ato.disable_on_alert) }
          ]
        }
      ]}
    >
      <AtoPrimitives ato={ato} usage={usage} />
    </ControllerSummary>
  )
}

export class RawATOMain extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.probeList = this.probeList.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleReset = this.handleReset.bind(this)
    this.handleToggleAddDiv = this.handleToggleAddDiv.bind(this)
  }

  componentDidMount () {
    this.props.fetchATOs()
    this.props.fetchEquipment()
    this.props.fetchInlets()
    this.props.atos.forEach(ato => this.props.fetchATOUsage(ato.id))
  }

  handleSubmit (values) {
    const payload = {
      name: values.name,
      enable: values.enable,
      inlet: values.inlet,
      period: parseInt(values.period),
      debounce: parseInt(values.debounce) || 0,
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

  handleToggleAddDiv () {
    this.setState({ add: !this.state.add })
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
    return this.props.atos.slice().sort((a, b) => SortByName(a, b))
      .map(probe => {
        const handleToggleState = () => {
          probe.enable = !probe.enable
          this.props.update(probe.id, probe)
        }
        const resetButton = (
          <Button
            type='button'
            name={'reset-ato-' + probe.id}
            variant='secondary'
            style={{ marginLeft: 'auto' }}
            onClick={() => { this.handleReset(probe) }}
          >
            {i18n.t('ato:reset_usage')}
          </Button>
        )
        const enhancedView = (
          <AtoSummary
            ato={probe}
            usage={this.props.atoUsage[probe.id]}
            inlets={this.props.inlets}
            equipment={this.props.equipment}
            macros={this.props.macros}
          />
        )
        return (
          <Collapsible
            key={'panel-ato-' + probe.id}
            name={'panel-ato-' + probe.id}
            item={probe}
            title={(
              <span className='reefpi-controller-title'>
                <span>{probe.name}</span>
                <span className='reefpi-controller-title__state'>{enabledLabel(probe.enable)}</span>
              </span>
            )}
            onDelete={this.handleDelete}
            onToggleState={handleToggleState}
            enabled={probe.enable}
            buttons={resetButton}
            separateEdit
            overflowActions
            actionsLabel={i18n.t('ato:actions', { name: probe.name, defaultValue: `Actions for ${probe.name}` })}
          >
            {enhancedView}
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
    const newATO = (
      <New
        initialAdd={this.state.add}
        inlets={this.props.inlets}
        equipment={this.props.equipment}
        macros={this.props.macros}
      />
    )

    if (this.props.atos.length === 0 && this.state.add) {
      return newATO
    }

    if (this.props.atos.length === 0) {
      return (
        <EmptyState
          title='No ATO configured'
          body='Connect a water level sensor to automate top-off dosing.'
          action={{ label: 'Add ATO', onClick: this.handleToggleAddDiv, testId: 'smoke-ato-add-toggle' }}
        />
      )
    }

    return (
      <div>
        <List>
          <CollapsibleList>{this.probeList()}</CollapsibleList>
          {newATO}
        </List>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    atos: state.atos,
    equipment: state.equipment,
    inlets: state.inlets,
    macros: state.macros,
    atoUsage: state.ato_usage || {}
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchATOs: () => dispatch(fetchATOs()),
    fetchEquipment: () => dispatch(fetchEquipment()),
    fetchInlets: () => dispatch(fetchInlets()),
    fetchATOUsage: id => dispatch(fetchATOUsage(id)),
    delete: id => dispatch(deleteATO(id)),
    update: (id, a) => dispatch(updateATO(id, a)),
    reset: (id) => dispatch(resetATO(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawATOMain)
export default Main
