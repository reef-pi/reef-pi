import React from 'react'
import PropTypes from 'prop-types'

export default class AutoProfile extends React.Component {
  constructor (props) {
    super(props)
    this.curry = this.curry.bind(this)
    this.sliderList = this.sliderList.bind(this)
  }

  curry (i) {
    return (ev) => {
      var values = []
      if (this.props.config && this.props.config.values) {
        values = this.props.config.values
      }
      values[i] = parseInt(ev.target.value)
      this.props.onChangeHandler({values: values})
    }
  }

  sliderList () {
    var values = []
    if (this.props.config && this.props.config.values) {
      values = this.props.config.values
    }
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
        <div className='col-sm-1' key={i + 1}>
          <div className='row text-center'>
            {values[i]}
          </div>
          <input
            type='range'
            style={rangeStyle}
            onChange={this.curry(i)}
            value={values[i]}
            id={'intensity-' + i}
            orient='vertical'
            disabled={this.props.readOnly}
          />
          <div className='row text-center'>
            {labels[i]}
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
