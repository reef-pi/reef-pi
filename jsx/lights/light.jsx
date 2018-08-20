import React, {Component} from 'react'
import LightChannel from './light_channel'
import update from 'immutability-helper'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'
import PropTypes from 'prop-types'
import {confirm} from '../utils/confirm'

class Light extends Component {
  constructor(props){
    super(props)

    this.state = {
      id: props.config.id,
      name: props.config.name,
      channels: props.config.channels,
      jack: props.config.jack,
      readOnly: true,
      expand: false
    }
   
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleChannelChange = this.handleChannelChange.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.toggleExpand = this.toggleExpand.bind(this)
    
  }

  handleFormSubmit(e){
    e.preventDefault()
    //TODO: [ML] Validation
    
    const payload = {
      name: this.props.config.name,
      channels: this.state.channels,
      jack: this.props.config.jack
    }
    for (let x in payload.channels) {
      payload.channels[x].reverse = (payload.channels[x].reverse == 'true')
    }
    this.props.save(this.props.config.id, payload)
    this.setState({readOnly: true, expand: false})
  }

  handleChannelChange(e, channelNum){
    //Create the change by transforming dot-notation into an object
    
    let target = {}
    let current = target
    const path = e.target.name.split('.')
    while (path.length > 0){
      const key = path.shift()
      current[key] = current[key] || path.length == 0 ? {$set: e.target.value} : {}
      current = current[key]
    }
    
    let change = update(this.state, {
      'channels': {
        [channelNum]: target
      }
    })

    this.setState(change)
  }

  handleEdit(e){
    e.stopPropagation()
    this.setState({readOnly: false, expand: true})
  }

  handleDelete(e){
    e.stopPropagation()
    const message = (
      <div>
        <p>This action will delete {this.props.config.name} and its configuration.</p>
      </div>
    )
     
    confirm('Delete ' + this.props.config.name, {description: message})
      .then(function(){
        this.props.remove(this.props.config.id)
      }.bind(this))    
  }

  toggleExpand(){
    this.setState({expand: !this.state.expand})
  }

  render(){

    let channels = <div />
    let action = <div />
    let editButton = <span />

    if (this.state.expand){
      channels = Object.keys(this.state.channels).map((item) => (
        <LightChannel
          key={item}
          readOnly={this.state.readOnly}
          onChangeHandler={this.handleChannelChange} 
          channel={this.state.channels[item]}
          channelNum={item}>
        </LightChannel>
      ))
    }

    if(this.state.readOnly){
      editButton = (
        <button type="button" 
          onClick={this.handleEdit}
          className="btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2">
          Edit
        </button>
      )
    }
    else {
      action = (
        <div className="clearfix">
          <input type="submit" value="Save" className="btn btn-primary float-right"></input>
        </div>
      )
    }
    
    const cursorStyle = {
      cursor: 'pointer'
    }

    return (
      <form className="todo" onSubmit={this.handleFormSubmit}>
        <div className="container">
          <div className="row mb-1"
            style={cursorStyle}
            onClick={this.toggleExpand}>
            <div className="col-12 col-sm-6 col-md-3 order-sm-last">
              <button type="button" 
                onClick={this.handleDelete}
                className="btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2">
                Delete
              </button>
              {editButton}
            </div>
            <div className="col-12 col-sm-6 col-md-9 order-sm-first">  
              {this.state.expand ? FaAngleUp() : FaAngleDown()}
              <b className="ml-2 align-middle">{this.state.name}</b>              
            </div>
          </div>
          {channels}
        </div>
        {this.state.expand ? action : ''}
      </form>
    )
  }
}

Light.propTypes = {
  config: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired
}

export default Light