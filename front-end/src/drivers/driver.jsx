import React from 'react'
import PropTypes from 'prop-types'
import { confirm } from 'utils/confirm'
import i18next from 'i18next'
import DriverForm from './driver_form'

export default class Driver extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      lbl: i18next.t('edit')
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
          {i18next.t('configuration:drivers:warn_delete').replace('$[name]', driver.name)}
        </p>
      </div>
    )
    confirm(i18next.t('delete'), { description: message }).then(
      function () {
        this.props.remove(driver.id)
      }.bind(this)
    )
  }

  handleEdit () {
    if (!this.state.edit) {
      this.setState({
        edit: true,
        lbl: i18next.t('save')
      })
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
            lbl: i18next.t('edit')
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
      <div className='row'>
        <div className='col-4'>{this.props.driver.name}</div>
        <div className='col-4'>
          <label className='small'>
            {this.props.driver.type}
          </label>
        </div>
      </div>
    )
  }

  render () {
    let btnEdit = null
    if (!this.state.edit) {
      btnEdit = (
        <input
          type='button'
          className='edit-outlet btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'
          value={this.state.lbl}
          onClick={this.handleEdit}
        />
      )
    }

    return (

      <div className='row border-bottom py-1'>
        <div className='col-8 col-md-9'>{this.state.edit ? this.editUI() : this.ui()}</div>
        <div className='col-4 col-md-3'>
          <input
            type='button'
            className='btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'
            value='X'
            onClick={ () => { this.handleRemove(this.props.driver) }}
          />
          {btnEdit}
        </div>
      </div>
    )
  }
}

Driver.propTypes = {
  driver: PropTypes.object,
  remove: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  driverOptions: PropTypes.object
}
