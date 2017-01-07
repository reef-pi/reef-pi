import React from 'react'
import $ from 'jquery'
import Connection from './connection.jsx'

export default class Outlets extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      outlets: [],
      addOutlet: false,
      connection: {}
    }

    this.fetchData = this.fetchData.bind(this)
    this.addOutlet = this.addOutlet.bind(this)
    this.removeOutlet = this.removeOutlet.bind(this)
    this.onChange = this.onChange.bind(this)
    this.listOutlets = this.listOutlets.bind(this)
    this.setConnection = this.setConnection.bind(this)
    this.toggleAddOutletDiv = this.toggleAddOutletDiv.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  setConnection (conn) {
    this.setState({
      connection: conn
    })
  }

  toggleAddOutletDiv () {
    this.setState({
      addOutlet: !this.state.addOutlet
    })
    $('#outlet-name').val('')
  }

  removeOutlet (ev) {
    var outletID = ev.target.id.split('-')[1]
    $.ajax({
      url: '/api/outlets/' + outletID,
      type: 'DELETE',
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  onChange (ev) {
    var os = this.state.outlets
    os[ev.target.id] = ev.target.value
    this.setState({
      outlets: os
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/outlets',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          outlets: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  listOutlets () {
    var rows = []
    $.each(this.state.outlets, function (k, v) {
      rows.push(
        <li className='list-group-item row' key={v.id}>
          <div className='col-sm-7'>{v.name} </div>
          <div className='col-sm-1'><input id={'outlet-' + v.id} type='button' value='delete' onClick={this.removeOutlet} className='btn btn-outline-danger' /> </div>
        </li>
        )
    }.bind(this))
    return rows
  }

  addOutlet () {
    var payload = {
      name: $('#outlet-name').val(),
      board: this.state.connection.board,
      pin: this.state.connection.pin,
      type: this.state.connection.type
    }
    $.ajax({
      url: '/api/outlets',
      type: 'PUT',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.toggleAddOutletDiv()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  render () {
    var dStyle = {
      display: this.state.addOutlet ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <ul className='list-group'>
          {this.listOutlets()}
        </ul>
        <div className='container'>
          <input className='btn btn-outline-success' type='button' value={this.state.addOutlet ? '-' : '+'} onClick={this.toggleAddOutletDiv} />
          <div className='container' style={dStyle}>
            <div className='row'>
              <div className='col-sm-1'>Name</div>
              <input type='text' id='outlet-name' className='col-sm-2' />
              <div className='col-sm-9'>
                <Connection updateHook={this.setConnection} />
              </div>
            </div>
            <div className='row'>
              <input type='button' value='add' onClick={this.addOutlet} className='btn btn-outline-primary' />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
