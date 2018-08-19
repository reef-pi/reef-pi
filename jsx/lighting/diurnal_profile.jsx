import React from 'react'
import PropTypes from 'prop-types'
import { Formik, Field } from 'formik'
import * as Yup from 'yup'
import FormikObserver from 'utils/form_observer'

const diurnalSchema = Yup.object().shape({
  start: Yup.string()
    .required('Start time is required.')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be a valid time (HH:MM).'),
  end: Yup.string()
    .required('End time is required.')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be a valid time (HH:MM).')
})

export default class DiurnalProfile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: {
        start: props.config && props.config.start ? props.config.start : '',
        end: props.config && props.config.end ? props.config.end : ''
      }
    }
    this.update = this.update.bind(this)
  }

  update (k) {
    var s = this.state.config
    return (ev) => {
      console.log('Updating ')
      s[k] = ev.target.value
      this.props.hook(s)
    }
  }

  render () {
    return (
      <Formik
        initialValues={{
          start: this.state.config.start,
          end: this.state.config.end
        }}
        validationSchema={diurnalSchema}
        render={({values, errors, touched, handleChange, handleBlur}) => (
          <form>
            <div className='form-inline row align-items-start'>
              <div className='form-group col-lg-4'>
                <label className='col-form-label col-sm-5'>Start Time</label>
                <input
                  type='text'
                  name='start'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  readOnly={this.props.readOnly}
                  className={'form-control col-lg-6 ' + (errors.start && touched.start ? 'is-invalid' : '')}
                  value={values.start}
                />
                {
                  errors.start && touched.start && 
                  (
                    <div className="field-error invalid-feedback text-center">{errors.start}</div>
                  )
                }
              </div>
              <div className='form-group col-lg-5'>
                <label className='col-form-label col-sm-5'>End Time</label>
                <Field type='text' name='end' required
                  className={'form-control col-lg-6 ' + (errors.end && touched.end ? 'is-invalid' : '')}
                  readOnly={this.props.readOnly}
                />
                {
                  errors.end && touched.end && 
                  (
                    <div className="field-error invalid-feedback text-center">{errors.end}</div>
                  )
                }
              </div>
              <FormikObserver
                onChange={({ values }) => console.log('onchange', values)}
              />
            </div>
          </form>
        )} 
      />
    )
  }
}

DiurnalProfile.propTypes = {
  config: PropTypes.object,
  hook: PropTypes.func,
  readOnly: PropTypes.bool
}
