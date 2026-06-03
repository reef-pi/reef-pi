import React from 'react'
import PropTypes from 'prop-types'
import { showError } from 'utils/alert'
import i18next from 'i18next'
import { byCapability } from './driver_filter'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

export default class Jack extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      name: props.name,
      pins: props.pins.join(','),
      driver: props.driver,
      reverse: props.reverse,
      lbl: i18next.t('edit'),
      driver_name: (props.drivers.filter(d => d.id === props.driver)[0] || {}).name
    }
    this.handleEdit = this.handleEdit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.handleSetDriver = this.handleSetDriver.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handlePinChange = this.handlePinChange.bind(this)
    this.handleReverseChange = this.handleReverseChange.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  handleReverseChange () {
    this.setState({ reverse: !this.state.reverse })
  }

  handlePinChange (e) {
    this.setState({ pins: e.target.value })
  }

  handleSetDriver (e) {
    this.setState({
      driver: e.target.value,
      driver_name: (this.props.drivers.filter(d => d.id === e.target.value)[0] || {}).name
    })
  }

  handleEdit () {
    if (!this.state.edit) {
      this.setState({
        edit: true,
        lbl: i18next.t('save')
      })
      return
    }
    const pins = this.state.pins.split(',').map(p => {
      return parseInt(p)
    })
    for (let i = 0; i < pins.length; i++) {
      if (isNaN(pins[i])) {
        showError(i18next.t('validation:comma_separated_numbers'))
        return
      }
    }
    const payload = {
      name: this.state.name,
      pins,
      driver: this.state.driver,
      reverse: this.state.reverse
    }
    this.props.update(payload)
    this.setState({
      edit: false,
      lbl: i18next.t('edit'),
      pins: payload.pins.join(',')
    })
  }

  editUI () {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
        <FormField label={i18next.t('name')}>
          <Input
            type='text'
            id={'jack-' + this.props.jack_id + '-name'}
            onChange={this.handleNameChange}
            className='jack-name'
            value={this.state.name}
          />
        </FormField>
        <FormField label={i18next.t('reverse')}>
          <Input
            className='jack-reverse'
            type='checkbox'
            onChange={this.handleReverseChange}
            id={'jack-' + this.props.jack_id + '-reverse'}
            checked={this.state.reverse}
          />
        </FormField>
        <FormField label={i18next.t('pins')}>
          <Input
            type='text'
            id={'jack-' + this.props.jack_id + '-pins'}
            onChange={this.handlePinChange}
            className='jack-pin'
            value={this.state.pins}
          />
        </FormField>
        <FormField label={i18next.t('driver')}>
          <Select
            name='driver'
            id={'jack-' + this.props.jack_id + '-driver-select'}
            onChange={this.handleSetDriver}
            value={this.state.driver}
          >
            {this.props.drivers.filter(byCapability('pwm')).map(item => {
              return (
                <option
                  key={item.id}
                  value={item.id}
                  id={'jack-' + this.props.jack_id + '-driver-' + item.id}
                >
                  {item.name}
                </option>
              )
            })}
          </Select>
        </FormField>
      </div>
    )
  }

  ui () {
    return (
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>{this.state.name}</div>
        <div>
          <label className='small'>
            {this.state.driver_name}
            ({this.state.pins})
            ({this.state.reverse ? 'active high' : 'active low'})
          </label>
        </div>
        <div />
      </div>
    )
  }

  handleRemove () {
    this.props.remove()
  }

  render () {
    return (
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', alignItems: 'center', borderBottom: '1px solid var(--reefpi-color-border)', padding: 'var(--reefpi-space-xs) 0' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>{this.state.edit ? this.editUI() : this.ui()}</div>
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', flexShrink: 0 }}>
          <Button
            variant='danger'
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
            className='jack-remove'
            onClick={this.handleRemove}
          >X
          </Button>
          <Button
            variant='secondary'
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
            className='jack-edit'
            onClick={this.handleEdit}
          >{this.state.lbl}
          </Button>
        </div>
      </div>
    )
  }
}

Jack.propTypes = {
  name: PropTypes.string.isRequired,
  reverse: PropTypes.bool.isRequired,
  pins: PropTypes.array.isRequired,
  jack_id: PropTypes.string.isRequired,
  remove: PropTypes.func,
  update: PropTypes.func,
  driver: PropTypes.string,
  drivers: PropTypes.array.isRequired
}
