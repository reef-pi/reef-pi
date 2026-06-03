import React from 'react'
import { connect } from 'react-redux'
import { fetchEquipment } from './redux/actions/equipment'
import { Menu } from '../design-system/ui_kits/reef-pi-app/primitives/Interaction'

export class RawSelectEquipment extends React.Component {
  constructor (props) {
    super(props)
    let equipment = { id: props.active, name: '' }
    props.equipment.forEach((eq, i) => {
      if (eq.id === equipment.id) {
        equipment = eq
      }
    })
    this.state = {
      equipment
    }
    this.equipmentList = this.equipmentList.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
  }

  componentDidMount () {
    this.props.fetchEquipment()
  }

  equipmentList () {
    const menuItems = [
      { label: '--', onSelect: this.setEquipment('none') }
    ]
    this.props.equipment.forEach((v, k) => {
      menuItems.push({
        label: v.name,
        onSelect: this.setEquipment(k)
      })
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
      readOnly
        ? (
          <button
            type='button'
            disabled
            style={{
              alignItems: 'center',
              background: 'var(--reefpi-color-pending-bg)',
              border: '1px solid var(--reefpi-color-border)',
              borderRadius: 'var(--reefpi-radius-sm)',
              color: 'var(--reefpi-color-text)',
              cursor: 'not-allowed',
              display: 'inline-flex',
              fontFamily: 'var(--reefpi-font-app)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              minHeight: 'var(--reefpi-tap-target-min)',
              minWidth: 'var(--reefpi-tap-target-min)',
              opacity: 0.58,
              padding: '0 var(--reefpi-space-md)'
            }}
          >
            {eqName}
          </button>
          )
        : (
          <Menu buttonLabel={eqName} items={this.equipmentList()} />
          )
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
)(RawSelectEquipment)
export default SelectEquipment
