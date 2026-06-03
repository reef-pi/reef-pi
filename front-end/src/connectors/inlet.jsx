import React from 'react'
import PropTypes from 'prop-types'
import i18next from 'i18next'
import Pin from './pin'
import { byCapability } from './driver_filter'
import { showUpdateSuccessful } from 'utils/alert'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

export default class Inlet extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      name: props.name,
      pin: props.pin,
      reverse: props.reverse,
      driver: props.driver || {},
      lbl: i18next.t('edit')
    }
    this.handleEdit = this.handleEdit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.onPinChange = this.onPinChange.bind(this)
    this.handleReverseChange = this.handleReverseChange.bind(this)
    this.handleDriverChange = this.handleDriverChange.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
  }

  handleDriverChange (e) {
    const driver = this.props.drivers.filter(d => d.id === e.target.value)[0] || {}
    this.setState({
      driver
    })
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  onPinChange (v) {
    this.setState({ pin: v })
  }

  handleReverseChange () {
    this.setState({ reverse: !this.state.reverse })
  }

  handleEdit () {
    if (!this.state.edit) {
      this.setState({
        edit: true,
        lbl: i18next.t('save')
      })
      return
    }
    const payload = {
      name: this.state.name,
      pin: this.state.pin,
      reverse: this.state.reverse,
      equipment: this.props.equipment,
      driver: this.state.driver.id
    }
    this.props.update(payload)
    showUpdateSuccessful()
    this.setState({
      edit: false,
      lbl: i18next.t('edit')
    })
  }

  editUI () {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
        <FormField label={i18next.t('name')}>
          <Input
            type='text'
            id={'inlet-' + this.props.inlet_id + '-name'}
            className='inlet-name'
            onChange={this.handleNameChange}
            value={this.state.name}
          />
        </FormField>
        <Pin
          driver={this.state.driver}
          current={this.state.pin}
          update={this.onPinChange}
          type='digital-input'
        />
        <FormField label={i18next.t('reverse')}>
          <Input
            className='inlet-reverse'
            type='checkbox'
            onChange={this.handleReverseChange}
            id={'inlet-' + this.props.inlet_id + '-reverse'}
            checked={this.state.reverse}
          />
        </FormField>
        <FormField label={i18next.t('driver')}>
          <Select
            name='driver'
            onChange={this.handleDriverChange}
            value={this.state.driver.id}
          >
            {this.props.drivers.filter(byCapability('digital-input')).map(item => {
              return (
                <option key={item.id} value={item.id}>
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
            {this.state.driver.name}({this.state.pin})
          </label>
        </div>
        <div>
          <label className='small'>{this.props.equipment === '' ? '' : i18next.t('in-use')}</label>
          <label className='small'>{this.state.reverse ? i18next.t('reverse') : ''}</label>
        </div>
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
            onClick={this.handleRemove}
          >X
          </Button>
          <Button
            variant='secondary'
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
            className='edit-inlet'
            onClick={this.handleEdit}
          >{this.state.lbl}
          </Button>
        </div>
      </div>
    )
  }
}
Inlet.propTypes = {
  name: PropTypes.string.isRequired,
  pin: PropTypes.number.isRequired,
  equipment: PropTypes.string,
  inlet_id: PropTypes.string.isRequired,
  remove: PropTypes.func.isRequired,
  reverse: PropTypes.bool.isRequired,
  update: PropTypes.func,
  driver: PropTypes.object.isRequired
}
