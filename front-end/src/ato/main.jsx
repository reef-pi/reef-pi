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

const RANGE_MS = { '1h': 3600000, '6h': 21600000, '1d': 86400000, '7d': 604800000, '30d': 2592000000 }

function AtoPrimitives ({ ato, usage }) {
  const [range, setRange] = useState('1d')
  if (!usage || !usage.historical) return null

  const cutoff = Date.now() - (RANGE_MS[range] || RANGE_MS['1d'])
  const points = usage.historical
    .filter(d => timestampToEpoch(d.time) >= cutoff)
    .map(d => ({ t: timestampToEpoch(d.time), v: d.pump }))
    .sort((a, b) => a.t - b.t)

  return (
    <div style={{ padding: 'var(--reefpi-space-xs) 0' }}>
      <RangeSelector value={range} onChange={setRange} compact scope={`ato-${ato.id}`} />
      <div style={{ marginTop: 'var(--reefpi-space-xs)' }}>
        <Sparkline
          points={points}
          stroke='var(--reefpi-color-brand)'
          fill='var(--reefpi-color-brand)'
          height={56}
          hover
        />
      </div>
    </div>
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
    if (window.FEATURE_FLAGS?.dashboard_v2) {
      this.props.atos.forEach(ato => this.props.fetchATOUsage(ato.id))
    }
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
            style={{ marginLeft: 'auto', padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
            onClick={() => { this.handleReset(probe) }}
          >
            {i18n.t('ato:reset_usage')}
          </Button>
        )
        const enhancedView = !!window.FEATURE_FLAGS?.dashboard_v2 && (
          <AtoPrimitives
            ato={probe}
            usage={this.props.atoUsage[probe.id]}
          />
        )
        return (
          <Collapsible
            key={'panel-ato-' + probe.id}
            name={'panel-ato-' + probe.id}
            item={probe}
            title={<b style={{ marginLeft: 'var(--reefpi-space-xs)', verticalAlign: 'middle' }}>{probe.name}</b>}
            onDelete={this.handleDelete}
            onToggleState={handleToggleState}
            enabled={probe.enable}
            buttons={resetButton}
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
