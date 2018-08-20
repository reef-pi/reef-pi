import React from 'react'
import PropTypes from 'prop-types'

export default class FixedProfile extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      value: props.config && props.config.value || '0'
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e){
    
    if (/^([0-9]{0,2}$)|(100)$/.test(e.target.value)){
      var val = parseInt(e.target.value)
      if (isNaN(val)) 
        val = ''
      this.setState({value: val})
      this.props.onChangeHandler({value: val})
    }
  }

  render(){
    return (
      <div className="row form-group justify-content-center">
        <div className="col-6 col-sm-3 col-md-2 col-xl-1 order-sm-2">
          <input type="text" name="value"
            className="form-control"
            value={this.state.value}
            onChange={this.handleChange}
            disabled={this.props.readOnly} />
        </div>
        <input name="value"
          className="col-11 col-sm-8 col-md-9 col-xl-10 order-sm-1"
          type="range"
          onChange={this.handleChange}
          disabled={this.props.readOnly}
          value={this.state.value}          
        />
        {this.props.readOnly}
      </div>
    )
  }
}

FixedProfile.propTypes = {
  value: PropTypes.string,
  readOnly: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired
}