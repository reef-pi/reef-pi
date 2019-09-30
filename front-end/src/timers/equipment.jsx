import React from 'react'
import PropTypes from 'prop-types'
import i18next from 'i18next'

export default class Equipment extends React.Component {
  constructor (props) {
    super(props)
    let name = ''
    props.equipment.forEach(eq => {
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
    this.setRevert = this.setRevert.bind(this)
    this.setDuration = this.setDuration.bind(this)
  }

  handleSetDuration (ev) {
    this.setState({
      duration: ev.target.value
    })
    this.props.update({
      duration: ev.target.value,
      revert: this.state.revert,
      on: this.state.on,
      id: this.state.id
    })
  }

  handleSetRevert (ev) {
    this.setState({
      revert: ev.target.checked
    })
    this.props.update({
      duration: this.state.duration,
      revert: ev.target.checked,
      on: this.state.on,
      id: this.state.id
    })
  }

  set (k) {
    return () => {
      this.setState({
        id: this.props.equipment[k].id,
        name: this.props.equipment[k].name
      })
      this.props.update({
        duration: this.state.duration,
        revert: this.state.revert,
        on: this.state.on,
        id: this.props.equipment[k].id
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
    const menuItems = []
    this.props.equipment.forEach((v, k) => {
      let cls = 'dropdown-item'
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
    const eqName = this.state.name
    const eqAction = this.state.on ? 'on' : 'off'
    let durationUI = <div />
    if (this.state.revert) {
      durationUI = (
        <div className='row'>
          <div className='col'>
            <label> Duration</label>
          </div>
          <div className='col'>
            <input
              id={this.props.id_prefix + '-equipment-action-duration'}
              type='text'
              onChange={this.handleSetDuration}
              className='col-lg-6'
              disabled={this.props.disabled}
              defaultValue={this.state.duration}
            />
            ({i18next.t('second_s')})
          </div>
        </div>
      )
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>{i18next.t('timers:equipment:equipment')}</div>
          <div className='col'>
            <div className='dropdown'>
              <button
                className='btn btn-secondary dropdown-toggle'
                type='button'
                id={this.props.id_prefix + '-equipment'}
                data-toggle='dropdown'
                disabled={this.props.disabled}
              >
                {eqName}
              </button>
              <div className='dropdown-menu'>{this.list()}</div>
            </div>
          </div>
        </div>
        <div className='row'>
          <label className='col'> {i18next.t('timers:equipment:action')}</label>
          <span className='col'>
            <div className='dropdown'>
              <button
                className='btn btn-secondary dropdown-toggle'
                type='button'
                id={this.props.id_prefix + '-equipmentAction'}
                disabled={this.props.disabled}
                data-toggle='dropdown'
              >
                {eqAction}
              </button>
              <div className='dropdown-menu'>
                <a className='dropdown-item' onClick={this.setAction(true)}>
                  {' '}
                  {i18next.t('timers:equipment:on')}{' '}
                </a>
                <a className='dropdown-item' onClick={this.setAction(false)}>
                  {' '}
                  {i18next.t('timers:equipment:off')}{' '}
                </a>
              </div>
            </div>
          </span>
        </div>
        <div className='row'>
          <div className='col'>
            <label> {i18next.t('timers:equipment:revert')} </label>
          </div>
          <div className='col'>
            <input
              id={this.props.id_prefix + '-equipment-revert'}
              type='checkbox'
              onClick={this.handleSetRevert}
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

  equipment: PropTypes.array.isRequired,
  disabled: PropTypes.bool.isRequired,
  id_prefix: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired
}
