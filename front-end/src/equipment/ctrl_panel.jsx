// *** new equipment control panel- JFR 20201201
import React from 'react'
import Equipment from './equipment'
import { fetchEquipment } from '../redux/actions/equipment'
import { fetchOutlets } from 'redux/actions/outlets'
import { connect } from 'react-redux'
import Switch from 'react-toggle-switch'

class ctrl_panel extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      selectedOutlet: undefined,
      timer: undefined
    }
  }

  componentDidMount () {
    const timer = window.setInterval(this.props.fetchEquipment, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }

  render () {

    if (this.props.equipment === undefined) {
      return <div />
    }
    return (
      <div className='container'>
        <span className='h6'>Equipment Control Panel</span><br /><br />
        <div className='row'>
          {this.props.equipment.sort((a, b) => { return a.name.localeCompare(b.name,
                                                navigator.languages[0] || navigator.language,
                                                {numeric:true, ignorePunctuation:true})
          }).map(item => {
            return (
              <div className='col-12 col-sm-6 col-md-2 col-lg-3 order-sm-3'>
                <Switch  on={item.on}>
                  <small className='ml-1 align-top'>{item.on ? 'on' : 'off'}</small>
                </Switch>
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
    equipment: state.equipment
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchEquipment: () => dispatch(fetchEquipment())
  }
}

const EquipmentCtrlPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(ctrl_panel)
export default EquipmentCtrlPanel
