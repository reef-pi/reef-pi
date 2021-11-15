import React from 'react'
import Modal from 'modal'
import i18n from 'utils/i18n'
import * as Yup from 'yup'
import { ErrorFor, ShowError } from '../utils/validation_helper'
import classNames from 'classnames'
import { withFormik, Field } from 'formik'

export class CalibrationForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }

    this.handleCancel = this.handleCancel.bind(this)
  }

  componentDidMount () {
    this.timer = setInterval(() => {
      this.props.readProbe(this.props.probe.id)
    }, 500)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  handleCancel () {
    this.props.cancel()
  }

  render () {
    return (
      <Modal>
        <form onSubmit={this.props.handleSubmit}>
          <div className='modal-header'>
            <h4 className='modal-title'>
              {i18n.t('temperature:calibrate')}: {this.props.probe.name}
            </h4>
          </div>
          <div className='modal-body'>

            <div className='form-group row'>
              <label htmlFor='value' className='col-4 col-form-label'>
                {i18n.t('temperature:calibration:set_temperature')}
              </label>
              <div className='col-4'>
                <div className='form-group'>
                  <Field
                    name='value'
                    type='number'
                    className={classNames('form-control', {
                      'is-invalid': ShowError('value', this.props.touched, this.props.errors)
                    })}
                  />
                  <ErrorFor errors={this.props.errors} touched={this.props.touched} name='value' />
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-4'>{i18n.t('temperature:current_reading')}</div>
              <div className='col-4'>{this.props.currentReading[this.props.probe.id]}</div>
            </div>
          </div>
          <div className='modal-footer'>
            <div className='text-center'>
              <button
                role='abort'
                type='button'
                className='btn btn-light mr-2'
                onClick={this.handleCancel}
              >
                {i18n.t('cancel')}
              </button>
              <button
                role='confirm'
                type='submit'
                className='btn btn-primary'
              >
                {i18n.t('apply')}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    )
  }
}

const CalibrateSchema = Yup.object().shape({
  value: Yup.number()
    .required(i18n.t('validation:number_required'))
})

const CalibrationModal = withFormik({
  displayName: 'CalibrateForm',
  mapPropsToValues: props => {
    return {
      value: props.defaultValue || props.currentReading[props.probe.id]
    }
  },
  validationSchema: CalibrateSchema,
  handleSubmit: (values, { props }) => {
    props.onSubmit(props.probe, parseFloat(values.value))
  }
})(CalibrationForm)

export default CalibrationModal
