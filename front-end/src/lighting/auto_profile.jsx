import React from 'react'
import PropTypes from 'prop-types'
import { ErrorFor, NameFor, ShowError } from 'utils/validation_helper'
import classNames from 'classnames'
import { Field } from 'formik'
import i18next from 'utils/i18n'
import { IsPercentageInput } from '../utils/percentage_input'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/

const secondsFor = value => {
  const [hour, minute] = value.split(':').map(Number)
  return (hour * 60 * 60) + (minute * 60)
}

const formatTime = seconds => {
  const day = 24 * 60 * 60
  const normalized = ((seconds % day) + day) % day
  const hour = String(Math.floor(normalized / 60 / 60)).padStart(2, '0')
  const minute = String(Math.floor((normalized % 3600) / 60)).padStart(2, '0')
  return `${hour}:${minute}`
}

const scheduleLabels = (startTime, endTime, count) => {
  if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime) || count === 0) {
    return Array(count).fill('')
  }

  const start = secondsFor(startTime)
  let end = secondsFor(endTime)
  if (end < start) end += 24 * 60 * 60
  if (count === 1) return [formatTime(start)]

  const interval = (end - start) / (count - 1)
  return Array.from({ length: count }, (_, index) => formatTime(start + (interval * index)))
}

const previewSegments = (labels, values) => {
  const left = 48
  const right = 696
  const top = 20
  const bottom = 136
  const day = 24 * 60 * 60
  const points = labels.map((label, index) => {
    if (!label) return undefined
    const seconds = secondsFor(`${label}:00`)
    const value = Math.max(0, Math.min(100, Number(values[index]) || 0))
    return {
      x: left + ((seconds / day) * (right - left)),
      y: top + (((100 - value) / 100) * (bottom - top))
    }
  }).filter(Boolean)

  return points.reduce((segments, point) => {
    const current = segments[segments.length - 1]
    if (!current || (current.length > 0 && point.x < current[current.length - 1].x)) {
      segments.push([point])
    } else {
      current.push(point)
    }
    return segments
  }, [])
}

export default class AutoProfile extends React.Component {
  constructor (props) {
    super(props)

    let values = Array(12).fill(0)
    if (props.config && props.config.values && Array.isArray(props.config.values)) {
      values = props.config.values
    }
    this.state = { values }
    this.previewId = `lighting-preview-${props.name.replace(/[^a-zA-Z0-9_-]/g, '-')}`

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

  handleRemovePoint (index) {
    const values = this.state.values.filter((_, itemIndex) => itemIndex !== index)
    this.props.onChangeHandler({
      start: this.props.config.start,
      end: this.props.config.end,
      values
    })
    this.setState({ values })
  }

  curry (index) {
    return event => {
      if (IsPercentageInput(event.target.value)) {
        const value = parseFloat(event.target.value)
        const values = [...this.state.values]
        values[index] = value
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
    const labels = scheduleLabels(this.props.config.start, this.props.config.end, values.length)

    return (
      <>
        <div className='reefpi-lighting-schedule__columns' aria-hidden='true'>
          <span>{i18next.t('lighting:time')}</span>
          <span>{i18next.t('lighting:intensity_percent', { defaultValue: 'Intensity (%)' })}</span>
          <span>{i18next.t('lighting:actions')}</span>
        </div>
        <ol
          className='reefpi-lighting-schedule__list'
          data-testid='lighting-schedule-list'
          aria-labelledby={`${this.previewId}-schedule-heading`}
        >
          {values.map((value, index) => (
            <li
              key={index}
              className='reefpi-lighting-schedule__point'
              data-testid='lighting-schedule-point'
            >
              <div className='reefpi-lighting-schedule__time-wrap'>
                <span className='reefpi-lighting-schedule__mobile-label'>{i18next.t('lighting:time')}</span>
                <time className='reefpi-lighting-schedule__time' dateTime={labels[index]}>{labels[index]}</time>
              </div>
              <div className='reefpi-lighting-schedule__value'>
                <label className='reefpi-lighting-schedule__mobile-label' htmlFor={`${this.previewId}-value-${index}`}>
                  {i18next.t('lighting:intensity_percent', { defaultValue: 'Intensity (%)' })}
                </label>
                <div className='reefpi-lighting-schedule__input-wrap'>
                  <input
                    id={`${this.previewId}-value-${index}`}
                    type='number'
                    min={0}
                    max={100}
                    inputMode='decimal'
                    name={NameFor(this.props.name, `values.${index}`)}
                    aria-label={i18next.t('lighting:intensity_at', {
                      defaultValue: 'Intensity at {{time}} (%)',
                      time: labels[index]
                    })}
                    onBlur={this.props.onBlur}
                    className={classNames('no-spinner', { 'is-invalid': ShowError(NameFor(this.props.name, `values.${index}`), this.props.touched, this.props.errors) })}
                    value={value}
                    onChange={this.curry(index)}
                    disabled={this.props.readOnly}
                  />
                  <span aria-hidden='true'>%</span>
                </div>
                <ErrorFor {...this.props} name={NameFor(this.props.name, `values.${index}`)} />
              </div>
              <Button
                type='button'
                variant='ghost'
                className='btn-remove-point reefpi-lighting-schedule__remove'
                onClick={this.handleRemovePoint.bind(this, index)}
                disabled={this.props.readOnly}
                aria-label={`${i18next.t('lighting:remove', { defaultValue: 'Remove' })} ${labels[index]}`}
              >
                {i18next.t('lighting:remove', { defaultValue: 'Remove' })}
              </Button>
            </li>
          ))}
        </ol>
        {values.length < 12 && (
          <Button
            type='button'
            variant='secondary'
            className='btn-add-point reefpi-lighting-schedule__add'
            onClick={this.handleAddPoint}
            disabled={this.props.readOnly}
          >
            {i18next.t('lighting:add_point', { defaultValue: 'Add point' })}
          </Button>
        )}
        <div className='reefpi-lighting-schedule__error'>
          <input type='hidden' className='is-invalid' />
          <ErrorFor {...this.props} name={NameFor(this.props.name, 'values')} />
        </div>
      </>
    )
  }

  renderPreview () {
    const values = this.state.values.map(value => value === undefined ? 0 : value)
    const labels = scheduleLabels(this.props.config.start, this.props.config.end, values.length)
    const segments = previewSegments(labels, values)
    const displayTime = value => TIME_PATTERN.test(value)
      ? formatTime(secondsFor(value))
      : i18next.t('lighting:time_not_set', { defaultValue: 'time not set' })
    const description = i18next.t('lighting:interval_preview_description', {
      defaultValue: '{{count}} schedule points from {{start}} to {{end}}, with intensity from 0 to 100 percent.',
      count: values.length,
      start: displayTime(this.props.config.start),
      end: displayTime(this.props.config.end)
    })

    return (
      <figure className='reefpi-lighting-preview'>
        <svg
          className='reefpi-lighting-preview__chart'
          data-testid='lighting-interval-preview'
          role='img'
          viewBox='0 0 720 180'
          preserveAspectRatio='none'
          aria-labelledby={`${this.previewId}-title ${this.previewId}-description`}
        >
          <title id={`${this.previewId}-title`}>{i18next.t('lighting:interval_preview', { defaultValue: '24-hour intensity preview' })}</title>
          <desc id={`${this.previewId}-description`}>{description}</desc>
          {[20, 78, 136].map(y => (
            <line key={`horizontal-${y}`} className='reefpi-lighting-preview__grid' x1='48' x2='696' y1={y} y2={y} />
          ))}
          {[48, 210, 372, 534, 696].map(x => (
            <line key={`vertical-${x}`} className='reefpi-lighting-preview__grid' x1={x} x2={x} y1='20' y2='136' />
          ))}
          {segments.map((segment, index) => (
            <polyline
              key={`segment-${index}`}
              className='reefpi-lighting-preview__line'
              points={segment.map(point => `${point.x},${point.y}`).join(' ')}
            />
          ))}
          {segments.flat().map((point, index) => (
            <circle key={`point-${index}`} className='reefpi-lighting-preview__point' cx={point.x} cy={point.y} r='4' />
          ))}
          <text className='reefpi-lighting-preview__label' x='42' y='24' textAnchor='end'>100%</text>
          <text className='reefpi-lighting-preview__label' x='42' y='82' textAnchor='end'>50%</text>
          <text className='reefpi-lighting-preview__label' x='42' y='140' textAnchor='end'>0%</text>
          {['00:00', '06:00', '12:00', '18:00', '24:00'].map((label, index) => (
            <text key={label} className='reefpi-lighting-preview__label' x={48 + (index * 162)} y='160' textAnchor={index === 0 ? 'start' : index === 4 ? 'end' : 'middle'}>{label}</text>
          ))}
        </svg>
        <figcaption>{i18next.t('lighting:interval_preview_caption', { defaultValue: 'Intensity (%) across local time. Exact values are listed below.' })}</figcaption>
      </figure>
    )
  }

  render () {
    const startId = `${this.previewId}-start`
    const endId = `${this.previewId}-end`

    return (
      <div className='reefpi-lighting-profile-panel'>
        <div className='reefpi-lighting-profile-panel__times'>
          <div>
            <label htmlFor={startId}>{i18next.t('start_time')}</label>
            <Field
              id={startId}
              name={NameFor(this.props.name, 'start')}
              readOnly={this.props.readOnly}
              className={classNames({ 'is-invalid': ShowError(NameFor(this.props.name, 'start'), this.props.touched, this.props.errors) })}
              placeholder='HH:mm:ss'
            />
            <ErrorFor {...this.props} name={NameFor(this.props.name, 'start')} />
          </div>
          <div>
            <label htmlFor={endId}>{i18next.t('end_time')}</label>
            <Field
              id={endId}
              name={NameFor(this.props.name, 'end')}
              readOnly={this.props.readOnly}
              className={classNames({ 'is-invalid': ShowError(NameFor(this.props.name, 'end'), this.props.touched, this.props.errors) })}
              placeholder='HH:mm:ss'
            />
            <ErrorFor {...this.props} name={NameFor(this.props.name, 'end')} />
          </div>
          <p className='reefpi-lighting-profile-panel__limit'>
            {i18next.t('lighting:intensity_limit', { defaultValue: 'Intensity range: 0–100%' })}
          </p>
        </div>
        {this.renderPreview()}
        <section className='reefpi-lighting-schedule' aria-labelledby={`${this.previewId}-schedule-heading`}>
          <div className='reefpi-controller-section__header'>
            <h4 id={`${this.previewId}-schedule-heading`} data-testid='lighting-schedule-heading'>
              {i18next.t('lighting:schedule_points', { defaultValue: 'Schedule points' })}
            </h4>
            <p>{i18next.t('lighting:schedule_help', { defaultValue: 'Times are distributed evenly between start and end. Enter each exact intensity from 0 to 100%.' })}</p>
          </div>
          {this.sliderList()}
        </section>
      </div>
    )
  }
}

AutoProfile.propTypes = {
  config: PropTypes.object.isRequired,
  errors: PropTypes.object,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onChangeHandler: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  touched: PropTypes.object
}

export { scheduleLabels }
