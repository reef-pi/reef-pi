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
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-6'>
            <div className='row'>
              <div className='col-sm-6'>Equipment</div>
              <div className='col-sm-6'>
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
              <label className='col-sm-6 '> Action</label>
              <span className='col-sm-6'>
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
              <label className='col-sm-6'> Revert</label>
              <input id='equipment-revert' type='checkbox' onClick={this.updateRevert} defaultChecked={false} />
            </div>
            <div className='row'>
              <label className='col-sm-6'> Duration</label>
              <input id='equipment-action-duration' type='text' className='col-sm-6' onChange={this.updateDuration} /> (in seconds)
            </div>
          </div>
        </div>
      </div>
    )
  }
}
