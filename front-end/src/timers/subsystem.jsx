import React from 'react'
import PropTypes from 'prop-types'
import i18n from 'utils/i18n'

export default class Subsystem extends React.Component {
  constructor (props) {
    super(props)
    let name = ''
    props.entities.forEach(eq => {
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
        id: this.props.entities[k].id,
        name: this.props.entities[k].name
      })
      this.props.update({
        duration: this.state.duration,
        revert: this.state.revert,
        on: this.state.on,
        id: this.props.entities[k].id
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
    this.props.entities.forEach((v, k) => {
      let cls = 'dropdown-item'
      if (v.id === this.state.id) {
        cls += ' active'
      }
      menuItems.push(
        <a key={k} className={cls} onClick={this.set(k)}>
          <span id={this.props.id_prefix + '-entity-' + v.id}>{v.name}</span>
        </a>
      )
    })
    return menuItems
  }

  render () {
    const eqName = this.state.name
    const eqAction = i18n.t((this.state.on) ? 'on' : 'off')
    let durationUI = <div />
    if (this.state.revert) {
      durationUI = (
        <div className='row'>
          <div className='col'>
            <label>{i18n.t('timers:duration')}</label>
          </div>
          <div className='col'>
            <input
              id={this.props.id_prefix + '-entity-action-duration'}
              type='text'
              onChange={this.handleSetDuration}
              className='col-lg-6'
              disabled={this.props.disabled}
              defaultValue={this.state.duration}
            />
            ({i18n.t('second_s')})
          </div>
        </div>
      )
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>{i18n.t(this.props.kind)}</div>
          <div className='col'>
            <div className='dropdown'>
              <button
                className='btn btn-secondary dropdown-toggle'
                type='button'
                id={this.props.id_prefix + '-entity'}
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
          <label className='col'>{i18n.t('timers:action')}</label>
          <span className='col'>
            <div className='dropdown'>
              <button
                className='btn btn-secondary dropdown-toggle'
                type='button'
                id={this.props.id_prefix + '-entity-action'}
                disabled={this.props.disabled}
                data-toggle='dropdown'
              >
                {eqAction}
              </button>
              <div className='dropdown-menu'>
                <a className='dropdown-item' onClick={this.setAction(true)}>
                  {i18n.t('on')}
                </a>
                <a className='dropdown-item' onClick={this.setAction(false)}>
                  {i18n.t('off')}
                </a>
              </div>
            </div>
          </span>
        </div>
        <div className='row'>
          <div className='col'>
            <label>{i18n.t('timers:revert')}</label>
          </div>
          <div className='col'>
            <input
              id={this.props.id_prefix + '-entity-revert'}
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

Subsystem.propTypes = {
  active_id: PropTypes.string.isRequired,
  revert: PropTypes.bool.isRequired,
  on: PropTypes.bool.isRequired,
  duration: PropTypes.number.isRequired,
  kind: PropTypes.string.isRequired,

  entities: PropTypes.array.isRequired,
  disabled: PropTypes.bool.isRequired,
  id_prefix: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired
}
