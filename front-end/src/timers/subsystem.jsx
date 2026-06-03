import React from 'react'
import PropTypes from 'prop-types'
import i18n from 'utils/i18n'
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'

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
      name,
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
    return this.props.entities.map((v, k) => ({
      label: v.name,
      onSelect: this.set(k)
    }))
  }

  render () {
    const eqName = this.state.name
    const eqAction = i18n.t((this.state.on) ? 'on' : 'off')
    let durationUI = <div />
    if (this.state.revert) {
      durationUI = (
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', alignItems: 'center', marginTop: 'var(--reefpi-space-xs)' }}>
          <label>{i18n.t('timers:duration')}</label>
          <input
            id={this.props.id_prefix + '-entity-action-duration'}
            type='text'
            onChange={this.handleSetDuration}
            disabled={this.props.disabled}
            defaultValue={this.state.duration}
          />
          ({i18n.t('second_s')})
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--reefpi-space-sm)' }}>
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-md)', alignItems: 'center' }}>
          <span>{i18n.t(this.props.kind)}</span>
          <Menu
            buttonLabel={eqName}
            items={this.list()}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-md)', alignItems: 'center' }}>
          <label>{i18n.t('timers:action')}</label>
          <Menu
            buttonLabel={eqAction}
            items={[
              { label: i18n.t('on'), onSelect: this.setAction(true) },
              { label: i18n.t('off'), onSelect: this.setAction(false) }
            ]}
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-md)', alignItems: 'center' }}>
          <label>{i18n.t('timers:revert')}</label>
          <input
            id={this.props.id_prefix + '-entity-revert'}
            type='checkbox'
            onClick={this.handleSetRevert}
            defaultChecked={this.state.revert}
            disabled={this.props.disabled}
          />
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
