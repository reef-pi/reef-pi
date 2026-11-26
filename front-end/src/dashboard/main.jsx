import React from 'react'
import { fetchEquipment, updateEquipment } from 'redux/actions/equipment'
import { connect } from 'react-redux'
import Config from './config'
import i18n from 'utils/i18n'
import DashboardV2 from '../../design-system/ui_kits/reef-pi-app/dashboard/DashboardV2'
import { buildEquipmentPayload } from 'equipment/utils'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

// The API reports equipment as { on: boolean }; the dashboard strip renders { state: 'on' | 'off' }.
export const equipmentStripItems = (equipment = []) =>
  equipment.map(item => ({ ...item, state: item.on ? 'on' : 'off' }))

export class RawDashboardMain extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showConfig: false
    }
    this.handleToggle = this.handleToggle.bind(this)
    this.handleEquipmentToggle = this.handleEquipmentToggle.bind(this)
  }

  handleToggle () {
    this.setState({ showConfig: !this.state.showConfig })
  }

  handleEquipmentToggle (id, next) {
    const eq = (this.props.equipment || []).find(e => String(e.id) === String(id))
    if (!eq) return
    this.props.updateEquipment(parseInt(id), buildEquipmentPayload(eq, { on: next === 'on' }))
  }

  render () {
    if (this.state.showConfig) {
      return (
        <div key='content'>
          <div style={{ marginBottom: 'var(--reefpi-space-sm)' }}>
            <Config />
          </div>
          <Button
            variant='secondary'
            onClick={this.handleToggle}
            id='configure-dashboard'
            data-testid='smoke-dashboard-configure'
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          >
            {i18n.t('dashboard:back_to_dashboard')}
          </Button>
        </div>
      )
    }

    return (
      <DashboardV2
        equipment={equipmentStripItems(this.props.equipment)}
        temperatureControllers={this.props.temperatureControllers}
        phProbes={this.props.phProbes}
        atos={this.props.atos}
        onToggle={this.handleEquipmentToggle}
        refreshEquipment={this.props.devMode ? this.props.fetchEquipment : undefined}
        onConfigure={this.handleToggle}
        sseEndpoint='/api/alerts'
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    equipment: state.equipment,
    devMode: state.capabilities?.dev_mode,
    temperatureControllers: state.tcs,
    phProbes: state.phprobes,
    atos: state.atos
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchEquipment: () => dispatch(fetchEquipment()),
    updateEquipment: (id, payload) => dispatch(updateEquipment(id, payload))
  }
}

const Dashboard = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawDashboardMain)
export default Dashboard
