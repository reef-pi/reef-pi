import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import classNames from 'classnames'
import { Field } from 'formik'
import i18next from 'i18next'

export default class AutoProfile extends React.Component {
  constructor (props) {
    super(props)

    let values = Array(12).fill(0)
    if (props.config && props.config.values && Array.isArray(props.config.values)) {
      values = props.config.values
    }
    this.state = { values: values }

    this.curry = this.curry.bind(this)
    this.handleAddPoint = this.handleAddPoint.bind(this)
    this.handleRemovePoint = this.handleRemovePoint.bind(this)
    this.sliderList = this.sliderList.bind(this)
    if (props.config && props.config.values && Array.isArray(props.config.values)) {
      this.state = {
        values: props.config.values
      }
    } else {
      this.state = {
        values: Array(12).fill(0)
      }
    }
  }

  handleAddPoint () {
    const values = [...this.state.values, 0]
    this.props.onChangeHandler({
      start: this.props.config.start,
      end: this.props.config.end,
      values: values
    })
    this.setState({ values: values })
  }

  handleRemovePoint (x) {
    const values = [...this.state.values]
    values.splice(x, 1)
    this.props.onChangeHandler({
      start: this.props.config.start,
      end: this.props.config.end,
      values: values
    })
    this.setState({ values: values })
  }

  curry (i) {
    return (ev) => {
      // TODO: [ML] Allow decimal in regex
      if (/^([0-9]{0,2}$)|(100)$|^([0-9]{1,2}.[0-9]+$)/.test(ev.target.value)) {
        const val = parseFloat(ev.target.value)

        const values = [...this.state.values]
        values[i] = val
        this.props.onChangeHandler({
          start: this.props.config.start,
          end: this.props.config.end,
          values: values
        })
        this.setState({ values: values })
      }
    }
  }

  sliderList () {
    const values = Object.assign({}, this.state).values

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
      if (values[i] === undefined) {
        values[i] = 0
      }
      list.push(
        <div className='col-12 col-md-1 text-center' key={i + 1}>
          <div className='row'>
            <div className='col-6 col-sm-6 col-md-12 d-block d-md-none d-lg-block order-md-first order-sm-last'>
              <button
                type='button'
                className='btn btn-link btn-sm btn-remove-point'
                onClick={this.handleRemovePoint.bind(this, i)}
              >
                Remove
              </button>
              <input
                type='number'
                name={NameFor(this.props.name, 'values.' + i)}
                onBlur={this.props.onBlur}
                className={classNames('form-control form-control-sm mb-1 d-block d-md-none d-lg-block px-0 px-sm-1 text-center no-spinner',
                  { 'is-invalid': ShowError(NameFor(this.props.name, 'values.' + i), this.props.touched, this.props.errors) })}
                value={values[i]}
                onChange={this.curry(i)}
                disabled={this.props.readOnly}
              />
            </div>
            <div className='d-none d-md-inline d-lg-none col-12'>
              {values[i]}
            </div>
            <div className='col-12 col-sm-6 col-md-12 d-none d-md-inline'>
              <input
                className='d-none d-md-inline'
                type='range'
                style={rangeStyle}
                onChange={this.curry(i)}
                value={values[i]}
                id={'intensity-' + i}
                orient='vertical'
                disabled={this.props.readOnly}
              />
            </div>
            <div className='col-6 col-md-12 col-sm-6 order-md-last order-first px-0'>
              {labels[i]}
            </div>
          </div>
        </div>
      )
    }
    if (values.length < 12) {
      list.push(
        <div className='col-12 col-md-1 text-center' key={values.length + 1}>
          <button type='button' className='btn btn-link btn-add-point' onClick={this.handleAddPoint}>Add Point</button>
        </div>
      )
    }
    return (list)
  }

  render () {
    return (
      <div className='container'>
        <div className='row mb-2'>
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
        </div>
        <div className='row'>
          {this.sliderList()}
          <div className='col-12 order-last text-center'>
            <input className='d-none is-invalid form-control' />
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
