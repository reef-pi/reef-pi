import React from 'react'
import $ from 'jquery'

export default class Equipment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      equipment: {
        duration: 0,
        revert: false,
        on: true,
        name: ''
      }
    }
    this.equipmentList = this.equipmentList.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
    this.setEquipmentAction = this.setEquipmentAction.bind(this)
    this.updateRevert = this.updateRevert.bind(this)
    this.updateDuration = this.updateDuration.bind(this)
  }

  updateRevert (ev) {
    var eq = this.state.equipment
    eq.revert = ev.target.checked
    this.setState({equipment: eq})
  }

  updateDuration (ev) {
    var eq = this.state.equipment
    eq.duration = ev.target.value
    this.setState({equipment: eq})
  }

  setEquipment (k) {
    return () => {
      var eq = this.state.equipment
      eq['id'] = this.props.equipments[k].id
      eq['name'] = this.props.equipments[k].name
      this.setState({equipment: eq})
      this.props.updateHook(eq)
    }
  }

  setEquipmentAction (k) {
    return () => {
      var eq = this.state.equipment
      eq.on = k
      this.setState({
        equipment: eq
      })
      this.props.updateHook(this.state.equipment)
    }
  }

  equipmentList () {
    var menuItems = []
    $.each(this.props.equipments, function (k, v) {
      menuItems.push(
        <a key={k} className='dropdown-item' onClick={this.setEquipment(k)}>
          <span id={'equipment-' + v.id}>{v.name}</span>
        </a>
      )
    }.bind(this))
    return menuItems
  }

  render () {
    var eqName = ''
    var eqAction = ''
    if (this.state.equipment !== undefined) {
      eqName = this.state.equipment.name
      eqAction = this.state.equipment.on ? 'on' : 'off'
    }
    var durationUI = <div />
    if (this.state.equipment.revert) {
      durationUI = <div className='row'>
        <div className='col'>
          <label > Duration</label>
        </div>
        <div className='col'>
          <input id='equipment-action-duration' type='text' onChange={this.updateDuration} className='col-lg-6' />(in seconds)
        </div>
      </div>
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>Equipment</div>
          <div className='col'>
            <div className='dropdown'>
              <button className='btn btn-secondary dropdown-toggle' type='button' id='equipment' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                {eqName}
              </button>
              <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                {this.equipmentList()}
              </div>
            </div>
          </div>
        </div>
        <div className='row'>
          <label className='col'> Action</label>
          <span className='col'>
            <div className='dropdown'>
              <button className='btn btn-secondary dropdown-toggle' type='button' id='equipmentAction' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                {eqAction}
              </button>
              <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                <a className='dropdown-item' onClick={this.setEquipmentAction(true)}> On </a>
                <a className='dropdown-item' onClick={this.setEquipmentAction(false)}> Off </a>
              </div>
            </div>
          </span>
        </div>
        <div className='row'>
          <div className='col'>
            <label> Revert </label>
          </div>
          <div className='col'>
            <input id='equipment-revert' type='checkbox' onClick={this.updateRevert} defaultChecked={false} />
          </div>
        </div>
        {durationUI}
      </div>
    )
  }
}
