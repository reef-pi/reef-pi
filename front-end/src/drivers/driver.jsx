import React from 'react'
import PropTypes from 'prop-types'
import { confirm } from 'utils/confirm'
import i18next from 'i18next'

export default class Driver extends React.Component {
  constructor (props) {
    const config = props.config || { address: '' }
    super(props)
    this.state = {
      name: props.name,
      config: config,
      lbl: i18next.t('edit')
    }
    this.handleEdit = this.handleEdit.bind(this)
    this.editUI = this.editUI.bind(this)
    this.ui = this.ui.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
  }

  handleRemove () {
    const message = (
      <div>
        <p>This action will delete this driver.</p>
      </div>
    )

    confirm('Delete driver', { description: message })
      .then(function () {
        this.props.remove(this.props.driver_id)
      }.bind(this))
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  handleAddressChange (e) {
    const config = this.state.config
    config.address = e.target.value
    this.setState({ config: config })
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
      config: this.state.config,
      type: this.props.type
    }
    this.props.update(this.props.driver_id, payload)
    this.setState({
      edit: false,
      lbl: i18next.t('edit'),
      name: payload.name,
      config: payload.config
    })
  }

  editUI () {
    return (
      <div className='row'>
        <div className='col-12 col-md-6'>
          <div className='form-group'>
            <span className='input-group-addon'>{i18next.t('name')}</span>
            <input
              type='text'
              id={'outlet-' + this.props.driver_id + '-name'}
              className='form-control driver-name'
              onChange={this.handleNameChange}
              value={this.state.name}
            />
          </div>
        </div>
        <div className='col-12 col-md-6'>
          <div className='form-group'>
            <span className='input-group-addon'>{i18next.t('address')}</span>
            <input
              type='text'
              id={'outlet-' + this.props.driver_id + '-address'}
              className='form-control driver-address'
              onChange={this.handleAddressChange}
              value={this.state.config.address}
            />
          </div>
        </div>
      </div>
    )
  }

  ui () {
    return (
      <div className='row'>
        <div className='col-4'>{this.state.name}</div>
        <div className='col-1'>
          <label className='small'>
            {this.state.type}
          </label>
        </div>
      </div>
    )
  }

  render () {
    return (

      <div className='row border-bottom py-1'>
        <div className='col-8 col-md-9'>{this.state.edit ? this.editUI() : this.ui()}</div>
        <div className='col-4 col-md-3'>
          <input
            type='button'
            className='btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'
            value='X'
            onClick={this.handleRemove}
          />
          <input
            type='button'
            className='edit-outlet btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'
            value={this.state.lbl}
            onClick={this.handleEdit}
          />
        </div>
      </div>
    )
  }
}

Driver.propTypes = {
  driver_id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  config: PropTypes.object,
  remove: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired
}
