import React from 'react'
import {connect} from 'react-redux'
import $ from 'jquery'
import {fetchEquipments} from './redux/actions/equipment'

class selectEquipment extends React.Component {
  constructor (props) {
    super(props)
    var equipment = {id: props.active, name: ''}
    $.each(props.equipments, function (i, eq) {
      if (eq.id === equipment.id) {
        equipment = eq
      }
    })
    this.state = {
      equipment: equipment
    }
    this.equipmentList = this.equipmentList.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
  }

  componentDidMount () {
    this.props.fetchEquipments()
  }

  equipmentList () {
    var menuItems = [
      <a className='dropdown-item' href='#' key='none' onClick={this.setEquipment('none')}>
        {'--'}
      </a>
    ]
    $.each(this.props.equipments, function (k, v) {
      var cName = 'dropdown-item'
      var active = false
      if (this.state.equipment !== undefined) {
        if (this.state.equipment.id === v.id) {
          cName += ' active'
        }
      }
      menuItems.push(
        <a className={cName} href='#' key={k} onClick={this.setEquipment(k)}>
          <span id={this.props.id + '-' + v.name}>{v.name}</span>
        </a>)
    }.bind(this))
    return menuItems
  }

  setEquipment (k) {
    return () => {
      if (k === 'none') {
        this.setState({
          equipment: undefined
        })
        this.props.update('')
        return
      }
      var eq = this.props.equipments[k]
      this.setState({
        equipment: eq
      })
      this.props.update(eq.id)
    }
  }

  render () {
    var readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    var eqName = ''
    if (this.state.equipment !== undefined) {
      eqName = this.state.equipment.name
    }
    return (
      <div className='dropdown'>
        <button className='btn btn-secondary dropdown-toggle' type='button' id={this.props.id} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' disabled={readOnly}>
          {eqName}
        </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          {this.equipmentList()}
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return { equipments: state.equipments }
}

const mapDispatchToProps = (dispatch) => {
  return {fetchEquipments: () => dispatch(fetchEquipments())}
}

const SelectEquipment = connect(mapStateToProps, mapDispatchToProps)(selectEquipment)
export default SelectEquipment
