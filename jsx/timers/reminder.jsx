import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export default class Reminder extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      message: '',
      title: ''
    }

    this.updateMessage = this.updateMessage.bind(this)
    this.updateTitle = this.updateTitle.bind(this)
  }

  updateTitle(ev) {
    this.setState({title: ev.target.value})
    this.props.updateHook({message: this.state.message, title: this.state.title})
  }

  updateMessage(ev) {
    this.setState({message: ev.target.value})
    this.props.updateHook({message: this.state.message, title: this.state.title})
  }

  render() {
    return(
      <div className='container'>
       <div className='row'>
         <label className='col-sm-3'>Title</label>
         <input className='col-sm-9' type='text' onChange={this.updateTitle}/>
       </div>
       <div className='row'>
         <label className='col-sm-3'>Message</label>
         <textarea className='col-sm-9' onChange={this.updateMessage}/>
       </div>
      </div>
    )
  }
}
