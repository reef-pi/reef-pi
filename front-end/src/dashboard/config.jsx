import React from 'react'
import Grid from './grid'
import { connect } from 'react-redux'
import { fetchDashboard, updateDashboard } from 'redux/actions/dashboard'
import { showError, showUpdateSuccessful } from 'utils/alert'
import i18next from 'i18next'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

const formGridStyle = {
  display: 'grid',
  gap: 'var(--reefpi-space-md)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  width: '100%'
}

export class RawDashboardConfig extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      updated: false,
      config: {}
    }
    this.handleSave = this.handleSave.bind(this)
    this.toRow = this.toRow.bind(this)
    this.updateHook = this.updateHook.bind(this)
  }

  componentDidMount () {
    this.props.fetchDashboard()
  }

  static getDerivedStateFromProps (props, state) {
    if (props.config === undefined || props.config === null) {
      return null
    }
    if (Object.keys(props.config).length === 0) {
      return null
    }
    if (state.updated) {
      return null
    }
    return { ...state, config: JSON.parse(JSON.stringify(props.config)) }
  }

  handleSave () {
    let error = false
    const payload = { ...this.state.config }
    payload.width = parseInt(payload.width)
    payload.height = parseInt(payload.height)
    payload.column = parseInt(payload.column)
    payload.row = parseInt(payload.row)
    const fieldsToCheck = ['width', 'height', 'column', 'row']
    for (const prop of fieldsToCheck) {
      if (payload[prop] <= 0) {
        showError('It seems like there is wrong data in your configuration. Please ensure you only have valid integers in fields.')
        error = true
      }
    }
    if (!error) {
      this.props.updateDashboard(payload)
      this.setState({ updated: false })
      showUpdateSuccessful()
    }
  }

  toRow (key, label, Min, Max) {
    const fn = function (ev) {
      const raw = ev.target.value
      if (raw === '') {
        this.setState({ updated: true, config: { ...this.state.config, [key]: '' } })
        return
      }
      const v = parseInt(raw)
      if (!isNaN(v)) {
        this.setState({ updated: true, config: { ...this.state.config, [key]: v } })
      }
    }.bind(this)
    return (
      <FormField label={label} key={key}>
        <Input
          type='number'
          onChange={fn}
          value={this.state.config[key]}
          id={'to-row-' + key}
          min={Min}
          max={Max}
        />
      </FormField>
    )
  }

  updateHook (cells) {
    const config = this.state.config
    const gridDetails = []
    let i, j
    for (i = 0; i < config.row; i++) {
      const rowArr = []
      for (j = 0; j < config.column; j++) {
        const row = cells[i] ? cells[i] : []
        const cell = row[j] ? row[j] : { id: 'none', type: 'blank_panel' }
        rowArr[j] = { id: cell.id, type: cell.type }
      }
      gridDetails[i] = rowArr
    }
    this.setState({
      config: { ...config, grid_details: gridDetails },
      updated: true
    })
  }

  render () {
    if (this.state.config.grid_details === undefined) {
      return <div />
    }
    return (
      <div style={{ width: '100%' }}>
        <div style={formGridStyle}>
          {this.toRow('row', i18next.t('rows'), 1, 12)}
          {this.toRow('column', i18next.t('columns'), 1, 12)}
          {this.toRow('width', i18next.t('width'), 100, 1920)}
          {this.toRow('height', i18next.t('height'), 100, 1080)}
        </div>
        <div style={{ marginTop: 'var(--reefpi-space-md)' }}>
          <Grid
            rows={this.state.config.row}
            cells={this.state.config.grid_details}
            columns={this.state.config.column}
            hook={this.updateHook}
            tcs={this.props.tcs}
            atos={this.props.atos}
            phs={this.props.phs}
            lights={this.props.lights}
            dosers={this.props.dosers}
            equips={this.props.equips}
            journals={this.props.journals}
            blank={this.props.blank}
          />
        </div>
        <div style={{ marginTop: 'var(--reefpi-space-md)' }}>
          <Button
            variant='primary'
            onClick={this.handleSave}
            id='save_dashboard'
            data-testid='smoke-dashboard-save'
            style={{ width: '100%' }}
          >
            {i18next.t('update')}
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    atos: state.atos,
    phs: state.phprobes,
    tcs: state.tcs,
    lights: state.lights,
    dosers: state.dosers,
    config: state.dashboard,
    equips: state.equipment,
    journals: state.journals,
    blank: state.blank
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDashboard: () => dispatch(fetchDashboard()),
    updateDashboard: d => dispatch(updateDashboard(d))
  }
}

const Config = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawDashboardConfig)
export default Config
