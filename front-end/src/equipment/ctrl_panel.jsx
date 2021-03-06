import React from 'react'
import { fetchEquipment, updateEquipment } from '../redux/actions/equipment'
import { connect } from 'react-redux'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from 'react-toggle-switch'
import { SortByName } from 'utils/sort_by_name'

class CtrlPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      timer: undefined
    }
    this.toggleState = this.toggleState.bind(this)
  }

  componentDidMount () {
    const timer = window.setInterval(this.props.fetchEquipment, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }

  toggleState (e, equipmentId, equipmentName, equipmentOn, equipmentOutlet) {
    e.preventDefault()
    const values = {
      id: equipmentId,
      name: equipmentName,
      on: !equipmentOn,
      outlet: equipmentOutlet
    }
    this.props.updateEquipment(parseInt(equipmentId), values)
  }

  render () {
    if (this.props.equipment === undefined) {
      return <div />
    }

    return (
      <div className='container' style={{ border: '1px solid black', marginBottom: '3px' }}>
        <span className='h6'>Equipment Switch Panel</span>
        <br />
        <div className='row'>
          {this.props.equipment.sort((a, b) => SortByName(a, b))
          .map(item => {
            return (
              <div className='col-12 col-sm-6 col-md-2 col-lg-3 order-sm-3' key={'eq-' + item.id}>
                <FormControlLabel
                  control={<Switch on={item.on} onClick={(e) => { this.toggleState(e, item.id, item.name, item.on, item.outlet) }} />}
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
)(CtrlPanel)

export default EquipmentCtrlPanel
