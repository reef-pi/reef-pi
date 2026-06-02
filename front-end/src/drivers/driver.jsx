import React from 'react'
import PropTypes from 'prop-types'
import { confirm } from 'utils/confirm'
import { showUpdateSuccessful } from 'utils/alert'
import i18n from 'utils/i18n'
import DriverForm from './driver_form'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

export default class Driver extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      lbl: i18n.t('edit')
    }
    this.handleSave = this.handleSave.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
  }

  handleRemove (driver) {
    const message = (
      <div>
        <p>
          {i18n.t('configuration:drivers:warn_delete', { name: driver.name })}
        </p>
      </div>
    )
    confirm(i18n.t('configuration:drivers:title_delete', { name: driver.name }), { description: message }).then(
      function () {
        this.props.remove(driver.id)
      }.bind(this)
    )
  }

  handleEdit () {
    if (this.props.read_only !== true) {
      if (!this.state.edit) {
        this.setState({
          edit: true,
          lbl: i18n.t('save')
        })
      }
    }
  }

  handleSave (values, { setErrors }) {
    const payload =
    {
      id: this.props.driver.id,
      name: values.name,
      config: values.config,
      type: values.type
    }

    this.props.validate(payload)
      .then(response => {
        if (response.status === 400) {
          response.json().then(data => {
            const config = {}
            Object.keys(data).forEach(item => {
              if (item.startsWith('config.')) {
                config[item.replace('config.', '')] = data[item]
              }
            })
            data.config = config
            setErrors(data)
          })
        } else {
          this.props.update(this.props.driver.id, payload)
          this.setState({
            edit: false,
            lbl: i18n.t('edit')
          })
        }
      })
  }

  editUI () {
    return (
      <DriverForm
        data={this.props.driver}
        mode='edit'
        onSubmit={this.handleSave}
        driverOptions={this.props.driverOptions}
      />
    )
  }

  ui () {
    return (
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>{this.props.driver.name}</div>
        <div>
          <label className='small'>
            {this.props.driver.type}
          </label>
        </div>
      </div>
    )
  }

  render () {
    let btnEdit = null
    let btnDelete = null
    let btnProvision = null

    if (this.props.read_only !== true) {
      if (!this.state.edit) {
        btnEdit = (
          <Button
            variant='secondary'
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
            className='edit-outlet'
            onClick={this.handleEdit}
          >{this.state.lbl}</Button>
        )
        btnProvision = (
          <Button
            variant='secondary'
            style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
            title={i18n.t('configuration:drivers:provision_title')}
            onClick={() => {
              this.props.provision(this.props.driver.id)
              showUpdateSuccessful()
            }}
          >{i18n.t('configuration:drivers:provision')}</Button>
        )
      }
      btnDelete = (
        <Button
          variant='danger'
          style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
          onClick={() => { this.handleRemove(this.props.driver) }}
        >X</Button>
      )
    }

    return (
      <div style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', alignItems: 'center', borderBottom: '1px solid var(--reefpi-color-border)', padding: 'var(--reefpi-space-xs) 0' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>{this.state.edit ? this.editUI() : this.ui()}</div>
        <div style={{ display: 'flex', gap: 'var(--reefpi-space-xs)', flexShrink: 0 }}>
          {btnDelete}
          {btnEdit}
          {btnProvision}
        </div>
      </div>
    )
  }
}

Driver.propTypes = {
  driver: PropTypes.object,
  remove: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  provision: PropTypes.func.isRequired,
  driverOptions: PropTypes.object
}
