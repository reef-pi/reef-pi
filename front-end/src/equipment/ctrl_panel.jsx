import React from 'react'
import { fetchEquipment, updateEquipment } from '../redux/actions/equipment'
import { connect } from 'react-redux'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from 'react-toggle-switch'
import { buildEquipmentPayload, EQUIPMENT_POLL_INTERVAL_MS, sortEquipment } from './utils'

export class CtrlPanelView extends React.Component {
  constructor (props) {
    super(props)
    this.toggleState = this.toggleState.bind(this)
  }

  componentDidMount () {
    this.timer = window.setInterval(this.props.fetchEquipment, EQUIPMENT_POLL_INTERVAL_MS)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  toggleState (e, equipment) {
    e.preventDefault()
    const values = buildEquipmentPayload(equipment, { on: !equipment.on })
    this.props.updateEquipment(parseInt(equipment.id), values)
  }

  render () {
    if (this.props.equipment === undefined) {
      return <div />
    }

    return (
      <div className='container' style={{ marginBottom: '3px' }}>
        <div className='row'>
          {sortEquipment(this.props.equipment)
            .map(item => {
              return (
                <div className='col-12 col-sm-6 col-md-2 col-lg-3 order-sm-3' key={'eq-' + item.id}>
                  <FormControlLabel
                    control={<Switch on={item.on} onClick={(e) => { this.toggleState(e, item) }} />}
                    label={item.name}
                  />
                </div>
              )
            })}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    equipment: state.equipment,
    outlets: state.outlets
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchEquipment: () => dispatch(fetchEquipment()),
    updateEquipment: (id, e) => dispatch(updateEquipment(id, e))
  }
}

const EquipmentCtrlPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(CtrlPanelView)

export default EquipmentCtrlPanel
