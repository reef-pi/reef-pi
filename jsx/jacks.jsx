import React from 'react'
import $ from 'jquery'

export default class Jacks extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      jacks: [],
      add: false
    }
    this.fetchData = this.fetchData.bind(this)
    this.listJacks = this.listJacks.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.save = this.save.bind(this)
  }

  remove (id) {
    return (function () {
      $.ajax({
        url: '/api/jacks/' + id,
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
    $('#jackName').val('')
    $('#jackPins').val('')
  }

  save () {
    var pins = $('#jackPins').val().split(',').map((p) => { return (parseInt(p)) })
    var payload = {
      name: $('#jackName').val(),
      pins: pins
    }
    $.ajax({
      url: '/api/jacks',
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
      url: '/api/jacks',
      type: 'GET',
      success: function (data) {
        this.setState({
          jacks: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  listJacks () {
    var list = []
    $.each(this.state.jacks, function (i, j) {
      list.push(
        <div className='row' key={j.name}>
          <div className='col-sm-2'>
            {j.name}
          </div>
          <div className='col-sm-1'>
            <input type='button' className='btn btn-outline-danger' value='X' onClick={this.remove(j.id)} />
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
    var oStyle = {
      border: 'solid 1px #aaa'
    }
    return (
      <div className='container' style={oStyle}>
        <div className='row'>
          <label className='h6'>Jacks</label>
        </div>
        <div className='row'>
          <div className='container'>
            {this.listJacks()}
          </div>
        </div>
        <div className='row'>
          <input id='add_jack' type='button' value={this.state.add ? '-' : '+'} onClick={this.add} className='btn btn-outline-success' />
          <div className='container' style={dStyle}>
            <div className='row'>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Name </span>
                  <input type='text' id='jackName' className='form-control' />
                </div>
              </div>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Pins </span>
                  <input type='text' id='jackPins' className='form-control' />
                </div>
              </div>
              <div className='col-sm-1'>
                <input type='button' id='createJack' value='add' onClick={this.save} className='btn btn-outline-primary' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
