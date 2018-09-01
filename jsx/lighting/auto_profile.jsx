import React from 'react'
import PropTypes from 'prop-types'
import {ErrorFor, NameFor, ShowError} from 'utils/validation_helper'
import classNames from 'classnames'

export default class AutoProfile extends React.Component {
  constructor (props) {
    super(props)

    var values = Array(12).fill(0)
    if (props.config && props.config.values && Array.isArray(props.config.values)) {
      values = props.config.values
    }
    this.state = {values: values}

    this.curry = this.curry.bind(this)
    this.sliderList = this.sliderList.bind(this)
  }

  curry (i) {
    return (ev) => {
      if (/^([0-9]{0,2}$)|(100)$/.test(ev.target.value)) {
        var val = parseInt(ev.target.value)
        if (isNaN(val)) { val = '' }

        var values = Object.assign(this.state.values)
        values[i] = val
        this.props.onChangeHandler({values: values})
        this.setState({values: values})
      }
    }
  }

  sliderList () {
    var values = Object.assign({}, this.state).values

    var rangeStyle = {
      WebkitAppearance: 'slider-vertical',
      writingMode: 'bt-lr',
      padding: '0 5px',
      width: '8px',
      height: '175px'
    }
    var list = []
    var labels = [
      '12 am',
      '2 am',
      '4 am',
      '6 am',
      '8 am',
      '10 am',
      '12 pm',
      '2 pm',
      '4 pm',
      '6 pm',
      '8 pm',
      '10 pm'
    ]

    for (var i = 0; i < 12; i++) {
      if (values[i] === undefined) {
        values[i] = 0
      }
      list.push(
        <div className='col-12 col-md-1 text-center' key={i + 1}>
          <div className='row'>
            <div className='col-6 col-sm-6 col-md-12 d-block d-md-none d-lg-block order-md-first order-sm-last'>
              <input type='text'
                name={NameFor(this.props.name, 'values.' + i)}
                onBlur={this.props.onBlur}
                className={classNames('form-control form-control-sm mb-1 d-block d-md-none d-lg-block',
                  {'is-invalid': ShowError(NameFor(this.props.name, 'values.' + i), this.props.touched, this.props.errors)})}
                value={values[i]}
                onChange={this.curry(i)}
                disabled={this.props.readOnly} />
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
    return (list)
  }

  render () {
    return (
      <div className='container'>
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
