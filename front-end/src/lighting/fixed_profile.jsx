import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import classNames from 'classnames'
import { Field } from 'formik'
import i18next from 'utils/i18n'
import { IsPercentageInput } from '../utils/percentage_input'

export default class FixedProfile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: (props.config && props.config.value) || '0'
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    if (IsPercentageInput(event.target.value)) {
      let value = parseFloat(event.target.value)
      if (isNaN(value)) value = ''
      this.setState({ value })
      this.props.onChangeHandler({
        start: this.props.config.start,
        end: this.props.config.end,
        value
      })
    }
  }

  render () {
    const baseId = `lighting-fixed-${this.props.name.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    const valueName = NameFor(this.props.name, 'value')

    return (
      <div className='reefpi-lighting-fixed'>
        <div>
          <label htmlFor={`${baseId}-start`}>{i18next.t('start_time')}</label>
          <Field
            id={`${baseId}-start`}
            name={NameFor(this.props.name, 'start')}
            readOnly={this.props.readOnly}
            className={classNames({ 'is-invalid': ShowError(NameFor(this.props.name, 'start'), this.props.touched, this.props.errors) })}
            placeholder='HH:mm:ss'
          />
          <ErrorFor {...this.props} name={NameFor(this.props.name, 'start')} />
        </div>
        <div>
          <label htmlFor={`${baseId}-end`}>{i18next.t('end_time')}</label>
          <Field
            id={`${baseId}-end`}
            name={NameFor(this.props.name, 'end')}
            readOnly={this.props.readOnly}
            className={classNames({ 'is-invalid': ShowError(NameFor(this.props.name, 'end'), this.props.touched, this.props.errors) })}
            placeholder='HH:mm:ss'
          />
          <ErrorFor {...this.props} name={NameFor(this.props.name, 'end')} />
        </div>
        <div className='reefpi-lighting-fixed__intensity'>
          <label htmlFor={`${baseId}-value`}>{i18next.t('lighting:intensity_percent', { defaultValue: 'Intensity (%)' })}</label>
          <div className='reefpi-lighting-fixed__value'>
            <input
              id={`${baseId}-value`}
              type='number'
              min={0}
              max={100}
              inputMode='decimal'
              name={valueName}
              className={classNames({ 'is-invalid': ShowError(valueName, this.props.touched, this.props.errors) })}
              value={this.state.value}
              onBlur={this.props.onBlur}
              onChange={this.handleChange}
              disabled={this.props.readOnly}
            />
            <span aria-hidden='true'>%</span>
          </div>
          <input
            className='reefpi-lighting-fixed__range'
            type='range'
            min={0}
            max={100}
            name={valueName}
            aria-label={i18next.t('lighting:intensity_slider', { defaultValue: 'Intensity slider' })}
            onChange={this.handleChange}
            disabled={this.props.readOnly}
            value={this.state.value}
          />
          <ErrorFor {...this.props} name={valueName} />
        </div>
      </div>
    )
  }
}

FixedProfile.propTypes = {
  config: PropTypes.object.isRequired,
  errors: PropTypes.object,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired,
  touched: PropTypes.object
}
