import React from 'react'
import $ from 'jquery'
import PropTypes from 'prop-types'

export default class Equipment extends React.Component {
  constructor (props) {
    super(props)
    var name = ''
    props.equipments.forEach((eq) => {
      if (eq.id === props.active_id) {
        name = eq.name
      }
    })
    this.state = {
      name: name,
      duration: props.duration,
      revert: props.revert,
      on: props.on,
      id: props.active_id
    }
    this.list = this.list.bind(this)
    this.set = this.set.bind(this)
    this.setAction = this.setAction.bind(this)
  }

  set (k) {
    return () => {
      this.setState({
        id: this.props.equipments[k].id,
        name: this.props.equipments[k].name
      })
      this.props.update({
        duration: this.state.duration,
        revert: this.state.revert,
        on: this.state.on,
        id: this.props.equipments[k].id
      })
    }
  }

  setAction (k) {
    return () => {
      this.setState({
        on: k
      })
      this.props.update({
        duration: this.state.duration,
        revert: this.state.revert,
        on: k,
        id: this.state.id
      })
    }
  }

  list () {
    var menuItems = []
    $.each(this.props.equipments, (k, v) => {
      var cls = 'dropdown-item'
      if (v.id === this.state.id) {
        cls += ' active'
      }
      menuItems.push(
        <a key={k} className={cls} onClick={this.set(k)}>
          <span id={this.props.id_prefix + '-equipment-' + v.id}>{v.name}</span>
        </a>
      )
    })
    return menuItems
  }

  render () {
    var eqName = this.state.name
    var eqAction = this.state.on ? 'on' : 'off'
    var durationUI = <div />
    if (this.state.revert) {
      durationUI = <div className='row'>
        <div className='col'>
          <label > Duration</label>
        </div>
        <div className='col'>
          <input
            id={this.props.id_prefix + '-equipment-action-duration'}
            type='text'
            onChange={(ev) => this.setState({duration: ev.target.value})}
            className='col-lg-6'
            disabled={this.props.disabled}
            defaultValue={this.state.duration}
          />
        (seconds)
        </div>
      </div>
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>Equipment</div>
          <div className='col'>
            <div className='dropdown'>
              <button
                className='btn btn-secondary dropdown-toggle'
                type='button'
                id={this.props.id_prefix + '-equipment'}
                data-toggle='dropdown'
                disabled={this.props.disabled}>
                {eqName}
              </button>
              <div className='dropdown-menu'>
                {this.list()}
              </div>
            </div>
          </div>
        </div>
        <div className='row'>
          <label className='col'> Action</label>
          <span className='col'>
            <div className='dropdown'>
              <button
                className='btn btn-secondary dropdown-toggle'
                type='button'
                id={this.props.id_prefix + '-equipmentAction'}
                disabled={this.props.disabled}
                data-toggle='dropdown' >
                {eqAction}
              </button>
              <div className='dropdown-menu'>
                <a className='dropdown-item' onClick={this.setAction(true)}> On </a>
                <a className='dropdown-item' onClick={this.setAction(false)}> Off </a>
              </div>
            </div>
          </span>
        </div>
        <div className='row'>
          <div className='col'>
            <label> Revert </label>
          </div>
          <div className='col'>
            <input
              id={this.props.id_prefix + '-equipment-revert'}
              type='checkbox'
              onClick={(ev) => this.setState({revert: ev.target.checked})}
              defaultChecked={this.state.revert}
              disabled={this.props.disabled}
            />
          </div>
        </div>
        {durationUI}
      </div>
    )
  }
}

Equipment.propTypes = {
  active_id: PropTypes.string.isRequired,
  revert: PropTypes.bool.isRequired,
  on: PropTypes.bool.isRequired,
  duration: PropTypes.number.isRequired,

  equipments: PropTypes.array.isRequired,
  disabled: PropTypes.bool.isRequired,
  id_prefix: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired
}
