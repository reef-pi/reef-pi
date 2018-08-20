import React, {Component} from 'react'
import Light from './light'
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
      <div>
        <div className="row">
          <div className="col">
            <div className="d-sm-none">xs</div>
            <div className="d-none d-sm-block d-md-none">sm</div>
            <div className="d-none d-md-block d-lg-none">md</div>
            <div className="d-none d-lg-block d-xl-none">lg</div>
            <div className="d-none d-xl-block">xl</div>
          </div>
        </div>
        <Light />
      </div>
    )
  }
}

export default FormContainer