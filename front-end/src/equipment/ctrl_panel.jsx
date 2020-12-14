// *** new equipment control panel- JFR 20201214
import React from 'react'
import { fetchEquipment, updateEquipment } from '../redux/actions/equipment'
import { connect } from 'react-redux'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from 'react-toggle-switch'

class ctrl_panel extends React.Component {

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

  // *** Toggles the equipment outlet on/off 
  toggleState(e, equipment_id, equipment_name, equipment_on, equipment_outlet) {
    e.preventDefault();
    const values = {
      id: equipment_id,
      name: equipment_name,
      on: !equipment_on,
      outlet: equipment_outlet
    }
    this.props.updateEquipment(parseInt(equipment_id), values)
  }
  
  render () {

    if (this.props.equipment === undefined) {
      return <div />
    }
    
    return (
      <div className='container'>
        <span className='h6' style={{color: 'red'}}>EXPERIMENTAL: Equipment Control Panel</span><br /><br />
        <div className='row'>
          {this.props.equipment.sort((a, b) => {
              return a.name.localeCompare(b.name, navigator.languages[0] || navigator.language, {numeric:true, ignorePunctuation:true});
            }).map(item => {
              return (
                <div className='col-12 col-sm-6 col-md-2 col-lg-3 order-sm-3'>
                  <FormControlLabel
                    control={<Switch on={item.on} onClick={(e) => {this.toggleState(e, item.id, item.name, item.on, item.outlet)}} />}
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
)(ctrl_panel)

export default EquipmentCtrlPanel
