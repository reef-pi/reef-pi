import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import classNames from 'classnames'
import { Field } from 'formik'
import i18next from 'i18next'

export default class FixedProfile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: (props.config && props.config.value) || '0'
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (e) {
    // TODO: [ML] Allow decimal in regex
    if (/^([0-9]{0,2}$)|(100)$|^([0-9]{1,2}.[0-9]+$)/.test(e.target.value)) {
      let value = parseFloat(e.target.value)
      if (isNaN(value)) {
        value = ''
      }
      this.setState({ value: value })
      this.props.onChangeHandler({
        start: this.props.config.start,
        end: this.props.config.end,
        value: value
      })
    }
  }

  render () {
    return (
      <>
        <div className='form-inline'>
          <label className='mr-2'>{i18next.t('start_time')}</label>
          <Field
            name={NameFor(this.props.name, 'start')}
            readOnly={this.props.readOnly}
            className={classNames('form-control mr-3 col-12 col-sm-3 col-md-2 col-lg-2',
              { 'is-invalid': ShowError(NameFor(this.props.name, 'start'), this.props.touched, this.props.errors) })}
            placeholder='HH:mm:ss'
          />
          <label className='mr-2'>{i18next.t('end_time')}</label>
          <Field
            name={NameFor(this.props.name, 'end')}
            readOnly={this.props.readOnly}
            className={classNames('form-control mr-3 col-12 col-sm-3 col-md-2 col-lg-2',
              { 'is-invalid': ShowError(NameFor(this.props.name, 'end'), this.props.touched, this.props.errors) })}
            placeholder='HH:mm:ss'
          />
          <ErrorFor {...this.props} name={NameFor(this.props.name, 'start')} />
          <ErrorFor {...this.props} name={NameFor(this.props.name, 'end')} />
        </div>
        <div className='row form-group justify-content-center'>
          <div className='col-6 col-sm-3 col-md-2 col-xl-1 order-sm-2 mb-1 mb-sm-0'>
            <input
              type='number'
              name={NameFor(this.props.name, 'value')}
              className={classNames('form-control no-spinner',
                { 'is-invalid': ShowError(NameFor(this.props.name, 'value'), this.props.touched, this.props.errors) })}
              value={this.state.value}
              onBlur={this.props.onBlur}
              onChange={this.handleChange}
              disabled={this.props.readOnly}
            />
          </div>
          <input
            name={NameFor(this.props.name, 'value')}
            className='col-11 col-sm-8 col-md-9 col-xl-10 order-sm-1'
            type='range'
            onChange={this.handleChange}
            disabled={this.props.readOnly}
            value={this.state.value}
          />
          <div className='col-12 order-last text-center'>
            <input className='d-none is-invalid form-control' />
            <ErrorFor {...this.props} name={NameFor(this.props.name, 'value')} />
          </div>
        </div>
      </>
    )
  }
}

FixedProfile.propTypes = {
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired
}
