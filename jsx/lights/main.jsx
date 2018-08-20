import React, {Component} from 'react'
import LightChannel from './light_channel'
import update from 'immutability-helper'

class FormContainer extends Component {
  constructor(props){
    super(props)

    this.state={
      readOnly: true,
      id: 4,
      jack: 3,
      name: 'Kessil',
      channels: {
        '5': {
          name: 'channel-1',
          color: '',
          start_min: 0,
          min: 0,
          max: 100,
          pin: 5,
          reverse: false,
          profile: {
            type: 'auto',
            config: {
              values: [0,0,0,10,20,40,30,30,0,0,0,0]
            }
          }
        },
        '6': {
          name: 'channel-2',
          color: '',
          start_min: 0,
          min: 0,
          max: 100,
          pin: 5,
          reverse: false,
          profile: {
            type: 'diurnal',
            config: {
              start: '11:44',
              end: '20:00'
            }
          }
        }
      }
    }

    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleChannelChange = this.handleChannelChange.bind(this)
    
  }

  handleFormSubmit(e){    
    console.log('handling the form submit')
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

  /*
  onChangeHandler={this.handleChannelChange.bind(this, this.state.channels[5])} 
  */

  render(){
    return (
      <form className="list-group-item" onSubmit={this.handleFormSubmit}>
        <pre>{ JSON.stringify(this.state, undefined, 2) }</pre>
        <div className="container">
          <div className="row">
            <div className="col">
              <b>{this.state.name}</b>
            </div>
          </div>
          {Object.keys(this.state.channels).map((item) => (
            <LightChannel
              key={item}
              readOnly={this.state.readOnly}
              onChangeHandler={this.handleChannelChange} 
              channel={this.state.channels[item]}
              channelNum={item}>
            </LightChannel>
          ))}          
        </div>
        <div>
          <input type="submit" value="Save"></input>
        </div>
      </form>
    )
  }
}

export default FormContainer