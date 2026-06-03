import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import classNames from 'classnames'
import { Field } from 'formik'
import i18next from 'i18next'
import { IsPercentageInput } from '../utils/percentage_input'

const inputStyle = { padding: 'var(--reefpi-space-xs)', border: '1px solid var(--reefpi-color-border)', borderRadius: 'var(--reefpi-radius-sm)', fontFamily: 'var(--reefpi-font-app)', width: '100%' }

export default class AutoProfile extends React.Component {
  constructor (props) {
    super(props)

    let values = Array(12).fill(0)
    if (props.config && props.config.values && Array.isArray(props.config.values)) {
      values = props.config.values
    }
    this.state = { values }

    this.curry = this.curry.bind(this)
    this.handleAddPoint = this.handleAddPoint.bind(this)
    this.handleRemovePoint = this.handleRemovePoint.bind(this)
    this.sliderList = this.sliderList.bind(this)
  }

  handleAddPoint () {
    const values = [...this.state.values, 0]
    this.props.onChangeHandler({
      start: this.props.config.start,
      end: this.props.config.end,
      values
    })
    this.setState({ values })
  }

  handleRemovePoint (x) {
    const values = this.state.values.filter((_, i) => i !== x)
    this.props.onChangeHandler({
      start: this.props.config.start,
      end: this.props.config.end,
      values
    })
    this.setState({ values })
  }

  curry (i) {
    return (ev) => {
      if (IsPercentageInput(ev.target.value)) {
        const val = parseFloat(ev.target.value)

        const values = [...this.state.values]
        values[i] = val
        this.props.onChangeHandler({
          start: this.props.config.start,
          end: this.props.config.end,
          values
        })
        this.setState({ values })
      }
    }
  }

  sliderList () {
    const values = this.state.values.map(value => value === undefined ? 0 : value)

    const rangeStyle = {
      WebkitAppearance: 'slider-vertical',
      writingMode: 'bt-lr',
      padding: '0 5px',
      width: '8px',
      height: '175px'
    }
    const list = []

    const labels = new Array(values.length)
    if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(this.props.config.start) &&
      /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(this.props.config.end)) {
      const startHour = parseInt(this.props.config.start.split(':')[0])
      const startMinute = parseInt(this.props.config.start.split(':')[1])
      let endHour = parseInt(this.props.config.end.split(':')[0])
      const endMinute = parseInt(this.props.config.end.split(':')[1])

      const start = (startHour * 60 * 60) + (startMinute * 60)

      if ((endHour < startHour) || (endHour === startHour && endMinute < startMinute)) { endHour += 24 }

      const totalSeconds =
        ((endHour * 60 * 60) + (endMinute * 60)) -
        ((startHour * 60 * 60) + (startMinute * 60))

      const interval = totalSeconds / (values.length - 1)

      for (let i = 0; i < values.length; i++) {
        const temp = start + (interval * i)
        let hour = Math.floor(temp / 60 / 60)
        if (hour > 23) { hour -= 24 }
        hour = '0' + hour
        let minute = '0' + Math.floor((temp % 3600) / 60)
        hour = hour.substr(hour.length - 2, hour.length)
        minute = minute.substr(minute.length - 2, minute.length)
        labels[i] = hour + ':' + minute
      }
    }

    for (let i = 0; i < values.length; i++) {
      list.push(
        <div style={{ textAlign: 'center', minWidth: '4rem' }} key={i + 1}>
          <button
            type='button'
            className='btn-remove-point'
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--reefpi-color-text)', fontSize: '0.875rem', padding: 'var(--reefpi-space-xxs)' }}
            onClick={this.handleRemovePoint.bind(this, i)}
          >
            {i18next.t('lighting:remove')}
          </button>
          <input
            type='number'
            name={NameFor(this.props.name, 'values.' + i)}
            onBlur={this.props.onBlur}
            className={classNames('no-spinner', { 'is-invalid': ShowError(NameFor(this.props.name, 'values.' + i), this.props.touched, this.props.errors) })}
            style={{ ...inputStyle, width: '4rem', textAlign: 'center', marginBottom: 'var(--reefpi-space-xxs)' }}
            value={values[i]}
            onChange={this.curry(i)}
            disabled={this.props.readOnly}
          />
          <div>
            <input
              type='range'
              style={rangeStyle}
              onChange={this.curry(i)}
              value={values[i]}
              id={'intensity-' + i}
              orient='vertical'
              disabled={this.props.readOnly}
            />
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            {labels[i]}
          </div>
        </div>
      )
    }
    if (values.length < 12) {
      list.push(
        <div style={{ textAlign: 'center', minWidth: '4rem' }} key={values.length + 1}>
          <button
            type='button'
            className='btn-add-point'
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--reefpi-color-text)', fontSize: '0.875rem', padding: 'var(--reefpi-space-xxs)' }}
            onClick={this.handleAddPoint}
          >
            {i18next.t('lighting:add_point')}
          </button>
        </div>
      )
    }
    return (list)
  }

  render () {
    return (
      <div>
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--reefpi-space-sm)', alignItems: 'flex-start', overflowX: 'auto' }}>
          {this.sliderList()}
          <div style={{ width: '100%', textAlign: 'center' }}>
            <input style={{ display: 'none' }} className='is-invalid' />
            <ErrorFor {...this.props} name={NameFor(this.props.name, 'values')} />
          </div>
        </div>
      </div>
    )
  }
}

AutoProfile.propTypes = {
  config: PropTypes.object,
  onChangehandler: PropTypes.func,
  readOnly: PropTypes.bool
}
