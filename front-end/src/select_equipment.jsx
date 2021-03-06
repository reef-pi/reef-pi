import React from 'react'
import { connect } from 'react-redux'
import { fetchEquipment } from './redux/actions/equipment'

class selectEquipment extends React.Component {
  constructor (props) {
    super(props)
    let equipment = { id: props.active, name: '' }
    props.equipment.forEach((eq, i) => {
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
    this.props.fetchEquipment()
  }

  equipmentList () {
    const menuItems = [
      <a className='dropdown-item' href='#' key='none' onClick={this.setEquipment('none')}>
        {'--'}
      </a>
    ]
    this.props.equipment.forEach((v, k) => {
      let cName = 'dropdown-item'
      if (this.state.equipment !== undefined) {
        if (this.state.equipment.id === v.id) {
          cName += ' active'
        }
      }
      menuItems.push(
        <a className={cName} href='#' key={k} onClick={this.setEquipment(k)}>
          <span id={this.props.id + '-' + v.name}>{v.name}</span>
        </a>
      )
    })
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
      const eq = this.props.equipment[k]
      this.setState({
        equipment: eq
      })
      this.props.update(eq.id)
    }
  }

  render () {
    const readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    let eqName = ''
    if (this.state.equipment !== undefined) {
      eqName = this.state.equipment.name
    }
    return (
      <div className='dropdown'>
        <button
          className='btn btn-secondary dropdown-toggle'
          type='button'
          id={this.props.id}
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
          disabled={readOnly}
        >
          {eqName}
        </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          {this.equipmentList()}
        </div>
      </div>
    )
  }
}
const mapStateToProps = state => {
  return { equipment: state.equipment }
}

const mapDispatchToProps = dispatch => {
  return { fetchEquipment: () => dispatch(fetchEquipment()) }
}

const SelectEquipment = connect(
  mapStateToProps,
  mapDispatchToProps
)(selectEquipment)
export default SelectEquipment
