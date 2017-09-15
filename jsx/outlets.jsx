import React from 'react'
import $ from 'jquery'

export default class Outlets extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      outlets: [],
      add: false
    }
    this.fetchData = this.fetchData.bind(this)
    this.listOutlets = this.listOutlets.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.save = this.save.bind(this)
  }

  remove (id) {
    return (function () {
      $.ajax({
        url: '/api/outlets/' + id,
        type: 'DELETE',
        success: function (data) {
          this.fetchData()
        }.bind(this),
        error: function (xhr, status, err) {
          console.log(err.toString())
        }
      })
    }.bind(this))
  }

  componentDidMount () {
    this.fetchData()
  }

  add () {
    this.setState({
      add: !this.state.add
    })
    $('#outletName').val('')
    $('#outletPin').val('')
  }

  save () {
    var payload = {
      name: $('#outletName').val(),
      pin: parseInt($('#outletPin').val())
    }
    $.ajax({
      url: '/api/outlets',
      type: 'PUT',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetchData()
        this.add()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/outlets',
      type: 'GET',
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
    var list = []
    $.each(this.state.outlets, function (i, o) {
      list.push(
        <div className='row'key={o.name}>
          <div className='col-sm-2'>
            {o.name}
          </div>
          <div className='col-sm-1'>
            <input type='button' className='btn btn-outline-danger' value='X' onClick={this.remove(o.id)} />
          </div>
        </div>
      )
    }.bind(this))
    return (list)
  }

  render () {
    var dStyle = {
      display: this.state.add ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <label className='h6'>Outlets</label>
        <div className='row'>
          <div className='container'>
            {this.listOutlets()}
          </div>
        </div>
        <div className='row'>
          <input id='add_outlet' type='button' value={this.state.add ? '-' : '+'} onClick={this.add} className='btn btn-outline-success' />
          <div className='container' style={dStyle}>
            <div className='row'>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Name </span>
                  <input type='text' id='outletName' className='form-control' />
                </div>
              </div>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Pin </span>
                  <input type='text' id='outletPin' className='form-control' />
                </div>
              </div>
              <div className='col-sm-1'>
                <input type='button' id='createOutlet' value='add' onClick={this.save} className='btn btn-outline-primary' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
