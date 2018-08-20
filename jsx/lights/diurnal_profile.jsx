import React from 'react'
import PropTypes from 'prop-types'

export default class DiurnalProfile extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      start: props.config && props.config.start || '',
      end: props.config && props.config.end || ''
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
      <div className="form-inline">
        
        <label className='mr-2'>Start Time</label>
        <input
          type='text'
          name='start'
          readOnly={this.props.readOnly}
          className='form-control mr-3 col-12 col-sm-3 col-md-2 col-lg-1'
          value={this.state.start}
          onChange={this.handleChange}
        />
      
        <label className='mr-2'>End Time</label>
        <input 
          type='text' 
          name='end' required
          className='form-control col-12 col-sm-3 col-md-2 col-lg-1'
          readOnly={this.props.readOnly}
          value={this.state.end}
          onChange={this.handleChange}
        />
      
      </div>
    )
  }
}

DiurnalProfile.propTypes = {
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired
}
