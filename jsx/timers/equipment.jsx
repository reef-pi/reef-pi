import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import {hideAlert} from '../utils/alert.js'
import {ajaxGet} from '../utils/ajax.js'

export default class Equipment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      equipment: {
        duration: 0,
        revert: false,
        on: true,
        name: ''
      },
      equipments: [],
    }
    this.equipmentList = this.equipmentList.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
    this.setEquipmentAction = this.setEquipmentAction.bind(this)
    this.updateRevert= this.updateRevert.bind(this)
    this.updateDuration = this.updateDuration.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  updateRevert(ev){
    var eq = this.state.equipment
    eq.revert = ev.target.checked
    this.setState({equipment: eq})
  }

  updateDuration(ev) {
    var eq = this.state.equipment
    eq.duration = ev.target.value
    this.setState({equipment: eq})
  }

  setEquipment (k, ev) {
    var eq  = this.state.equipment
    eq['id'] = this.state.equipments[k].id
    eq['name'] = this.state.equipments[k].name
    this.setState({equipment: eq})
    this.props.updateHook(eq)
  }

  setEquipmentAction (k, ev) {
    var eq = this.state.equipment
    eq.on =  k === 'on'
    this.setState({
      equipment: eq
    })
    this.props.updateHook(this.state.equipment)
  }

  equipmentList () {
    var menuItems = []
    $.each(this.state.equipments, function (k, v) {
      menuItems.push(<MenuItem key={k} eventKey={k}><span id={'equipment-'+v.id}>{v.name}</span></MenuItem>)
    })
    return menuItems
  }

  fetchData () {
    ajaxGet({
      url: '/api/equipments',
      success: function (data) {
        this.setState({
          equipments: data,
        })
        hideAlert()
      }.bind(this)
    })
  }

  render () {
    var eqName = ''
    var eqAction = ''
    if(this.state.equipment !== undefined) {
      eqName = this.state.equipment.name
      eqAction = this.state.equipment.on ? 'on' : 'off'
    }
    return(
      <div className='container'>
        <div className='row'>
          <div className='col-sm-6'>
            <div className='row'>
              <div className='col-sm-6'>Equipment</div>
              <div className='col-sm-6'>
                <DropdownButton title={eqName} id='equipment' onSelect={this.setEquipment}>
                  {this.equipmentList()}
                </DropdownButton>
              </div>
            </div>
            <div className='row'>
              <label className='col-sm-6 '> Action</label>
              <span className='col-sm-6'>
                <DropdownButton title={eqAction} id='equipmentAction' onSelect={this.setEquipmentAction}>
                  <MenuItem key='on' eventKey='on'> On </MenuItem>
                  <MenuItem key='off' eventKey='off'> Off </MenuItem>
                </DropdownButton>
              </span>
            </div>
            <div className='row'>
              <label className='col-sm-6'> Revert</label>
              <input id='equipment-revert' type='checkbox' onClick={this.updateRevert} defaultChecked={false}/>
            </div>
            <div className='row'>
              <label className='col-sm-6'> Duration</label>
              <input id='equipment-action-duration' type='text' className='col-sm-6' onChange={this.updateDuration}/> (in seconds)
            </div>
          </div>
      </div>
    </div>
    )
  }
}
