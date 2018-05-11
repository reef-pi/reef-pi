import $ from 'jquery'
import React from 'react'
import {ajaxPut} from '../utils/ajax.js'
import {showAlert, hideAlert} from '../utils/alert.js'
import JackSelector from '../jack_selector.jsx'

export default class New extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      add: false,
      pin: undefined,
      jack: undefined
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.ui = this.ui.bind(this)
    this.update = this.update.bind(this)
    this.setJack = this.setJack.bind(this)
  }

  setJack(j, p) {
    this.setState({jack: j, pin: parseInt(p)})
  }

  update(k) {
    return(function(ev){
      var h ={}
      h[k] = ev.target.value
      this.setState(h)
    }.bind(this))
  }

  toggle () {
    this.setState({
      add: !this.state.add
    })
    this.setState({
      name: '',
      pin: 0,
    })
  }

  ui () {
    if (!this.state.add) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>Name</div>
          <div className='col-sm-2'><input type='text' onChange={this.update('name')} value={this.state.name} id='doser_name'/></div>
        </div>
        <div className='row'>
           <JackSelector update={this.setJack} id='new_doser'/>
        </div>
        <input type='button' id='create_pump' value='add' onClick={this.add} className='btn btn-outline-primary' />
      </div>
    )
  }

  
  add () {
    if (this.state.name === '') {
      showAlert('Specify doser name')
      return
    }
    var payload = {
      name: this.state.name,
      pin: parseInt(this.state.pin),
      jack: this.state.jack,
    }
    ajaxPut({
      url: '/api/doser/pumps',
      data: JSON.stringify(payload),
      success: function (data) {
        hideAlert()
        this.toggle()
        this.props.updateHook()
      }.bind(this)
    })
  }
  render() {
    return(
      <div className='container'>
        <input id='add_doser' type='button' value={this.state.add ? '-' : '+'} onClick={this.toggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}
