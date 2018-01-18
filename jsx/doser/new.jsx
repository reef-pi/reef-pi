import Common from '../common.jsx'
import $ from 'jquery'
import React from 'react'

export default class New extends Common {
  constructor (props) {
    super(props)
    this.state = {
      dosers: [],
      add: false
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.ui = this.ui.bind(this)
  }

  toggle () {
    this.setState({
      add: !this.state.add
    })
    $('#pump-name').val('')
  }

  ui () {
    if (!this.state.add) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>Name</div>
          <div className='col-sm-2'><input type='text' id='pump-name' /></div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Pin</div>
          <div className='col-sm-1'><input type='text' id='pump-pin' className='col-sm-1' /></div>
        </div>
        <input type='button' id='create_pump' value='add' onClick={this.add} className='btn btn-outline-primary' />
      </div>
    )
  }

  
  add () {
    if (this.state.selectedEquipment === undefined) {
      this.setState({
        showAlert: true,
        alertMsg: 'Select an equipment'
      })
      return
    }
    if ($('#pump-name').val() === '') {
      this.setState({
        showAlert: true,
        alertMsg: 'Specify doser name'
      })
      return
    }
    var payload = {
      name: $('#pump-name').val(),
    }
    this.ajaxPut({
      url: '/api/dosers',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetch()
        this.setState({
          add: !this.state.add
        })
        $('#doserName').val('')
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
