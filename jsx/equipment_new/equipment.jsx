import React from 'react'
import ViewEquipment from './view_equipment'
import EquipmentForm from './equipment_form'
import PropTypes from 'prop-types'


export default class Equipment extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      action: (props.on ? 'off' : 'on'),
      outlet: props.outlet,
      name: props.name,
      edit: false,
      lbl: 'edit',
      readOnly: true

    }

    this.control = this.control.bind(this)
    this.edit = this.edit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.outlets = this.outlets.bind(this)
    this.setOutlet = this.setOutlet.bind(this)
    this.setName = this.setName.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
  }

  setName (ev) {
    this.setState({name: ev.target.value})
  }

  setOutlet (i) {
    return ev => {
      this.setState({
        outlet: i
      })
    }
  }

  outlets () {
    var items = []
    $.each(this.props.outlets, function (i, v) {
      items.push(
        <a
          className='dropdown-item'
          href='#'
          onClick={this.setOutlet(v)}
          key={'outlet-' + i}>
          <span id={'outlet-' + v.id}>{v.name}</span>
        </a>)
    }.bind(this))
    return items
  }

  edit () {
    if (!this.state.edit) {
      this.setState({
        edit: true,
        lbl: 'save'
      })
      return
    }
    var payload = {
      name: this.state.name,
      outlet: this.state.outlet.id,
      on: this.state.action !== 'on'
    }
    this.props.update(payload)
    this.setState({
      edit: false,
      lbl: 'edit'
    })
  }

  editUI () {
    return (
      <div className='row'>
        <div className='col'>
          <div className='input-group'>
            <span className='input-group-addon'> Name </span>
            <input
              type='text'
              id={'equipment-' + this.props.equipment_id + '-name'}
              className='form-control'
              defaultValue={this.state.name}
              onChange={this.setName}
            />
          </div>
        </div>
        <div className='col'>
          <div className='row'>
            <div className='col'>Outlet</div>
            <div className='col'>
              <div className='dropdown'>
                <button
                  className='btn btn-secondary dropdown-toggle'
                  type='button'
                  id='outlet'
                  data-toggle='dropdown'
                >
                  {this.state.outlet.name}
                </button>
                <div className='dropdown-menu'>
                  {this.outlets()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  ui () {
    var onBtnClass = 'btn btn-secondary btn-block'
    if (this.state.action === 'off') {
      onBtnClass = 'btn btn-success btn-block'
    }
    return (
      <div className='row'>
        <div className='col-lg-3 col-xs-4'>
          <input
            id={'equipment-control-' + this.props.equipment_id + '-on'}
            type='button'
            value={this.state.name}
            onClick={this.control}
            className={onBtnClass}
          />
        </div>
        <div className='col-lg-2 col-xs-3'>
          <label className='small'> {this.state.outlet.name} </label>
        </div>
      </div>
    )
  }

  control (e) {
    var payload = {
      on: this.state.action === 'on',
      name: this.state.name,
      outlet: this.state.outlet.id
    }
    this.props.update(payload)
    this.setState({
      action: this.state.action === 'on' ? 'off' : 'on'
    })
  }

  selectedOutlet(){
    for (let i = 0; i < this.props.outlets.length; i++){
      if (this.props.outlets[i].id == this.props.equipment.outlet) return this.props.outlets[i]
    }
    return null
  }

  handleEdit (e) {
    e.stopPropagation()
    this.setState({readOnly: false})
  }

  render () {

    return (
      <li className='list-group-item'>
        {this.state.readOnly === true ?
          <ViewEquipment equipment = {this.props.equipment}
            outletName = {this.selectedOutlet().name}
            onStateChange = {() => {}}
            onDelete = {this.props.delete}
            onEdit = {this.handleEdit} /> :
          <EquipmentForm equipment = {this.props.equipment}
            outlets = {this.props.outlets}
            onSubmit = {this.props.submitForm}
            onUpdate = {this.props.update}
            onDelete = {this.props.delete} />
        }
      </li>
    )
  }
}
