import React from 'react'
import PropTypes from 'prop-types'

export default class DiurnalProfile extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      start: props.config.start || '',
      end: props.config.end || ''
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e){
  
    let config = Object.assign({}, this.state)
    config[e.target.name] = e.target.value
    this.setState({[e.target.name]: e.target.value})

    this.props.onChangeHandler(config)
  
  }

  render(){
    return (
      <div className='form-inline row align-items-start'>
        <div className='form-group col-lg-4'>
          <label className='col-form-label col-sm-5'>Start Time</label>
          <input
            type='text'
            name='start'
            readOnly={this.props.readOnly}
            className='form-control col-lg-6'
            value={this.state.start}
            onChange={this.handleChange}
          />
        </div>
        <div className='form-group col-lg-5'>
          <label className='col-form-label col-sm-5'>End Time</label>
          <input type='text' name='end' required
            className='form-control col-lg-6'
            readOnly={this.props.readOnly}
            value={this.state.end}
            onChange={this.handleChange}
          />
        </div>
      </div>
    )
  }
}

DiurnalProfile.propTypes = {
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired
}
