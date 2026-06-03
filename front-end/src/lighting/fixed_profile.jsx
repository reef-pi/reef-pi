import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import classNames from 'classnames'
import { Field } from 'formik'
import i18next from 'i18next'
import { IsPercentageInput } from '../utils/percentage_input'

const inputStyle = { padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)', width: '100%' }

export default class FixedProfile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: (props.config && props.config.value) || '0'
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (e) {
    if (IsPercentageInput(e.target.value)) {
      let value = parseFloat(e.target.value)
      if (isNaN(value)) {
        value = ''
      }
      this.setState({ value })
      this.props.onChangeHandler({
        start: this.props.config.start,
        end: this.props.config.end,
        value
      })
    }
  }

  render () {
    return (
      <>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--reefpi-space-sm)', alignItems: 'flex-end', marginBottom: 'var(--reefpi-space-sm)' }}>
          <div>
            <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('start_time')}</label>
            <Field
              name={NameFor(this.props.name, 'start')}
              readOnly={this.props.readOnly}
              className={classNames({ 'is-invalid': ShowError(NameFor(this.props.name, 'start'), this.props.touched, this.props.errors) })}
              style={inputStyle}
              placeholder='HH:mm:ss'
            />
            <ErrorFor {...this.props} name={NameFor(this.props.name, 'start')} />
          </div>
          <div>
            <label style={{ marginRight: 'var(--reefpi-space-xs)' }}>{i18next.t('end_time')}</label>
            <Field
              name={NameFor(this.props.name, 'end')}
              readOnly={this.props.readOnly}
              className={classNames({ 'is-invalid': ShowError(NameFor(this.props.name, 'end'), this.props.touched, this.props.errors) })}
              style={inputStyle}
              placeholder='HH:mm:ss'
            />
            <ErrorFor {...this.props} name={NameFor(this.props.name, 'end')} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--reefpi-space-sm)' }}>
          <input
            type='number'
            name={NameFor(this.props.name, 'value')}
            className={classNames({ 'is-invalid': ShowError(NameFor(this.props.name, 'value'), this.props.touched, this.props.errors) })}
            style={{ ...inputStyle, width: '5rem' }}
            value={this.state.value}
            onBlur={this.props.onBlur}
            onChange={this.handleChange}
            disabled={this.props.readOnly}
          />
          <input
            name={NameFor(this.props.name, 'value')}
            style={{ flex: 1 }}
            type='range'
            onChange={this.handleChange}
            disabled={this.props.readOnly}
            value={this.state.value}
          />
          <div style={{ textAlign: 'center' }}>
            <input style={{ display: 'none' }} className='is-invalid' />
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
