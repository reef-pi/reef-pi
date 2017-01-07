import React from 'react'
import $ from 'jquery'

export default class Boards extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addBoard: false,
      boards: []
    }
    this.addBoard = this.addBoard.bind(this)
    this.boardList = this.boardList.bind(this)
    this.deleteBoard = this.deleteBoard.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.toggleAddBoardDiv = this.toggleAddBoardDiv.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  toggleAddBoardDiv () {
    this.setState({
      addBoard: !this.state.addBoard
    })
    $('#boardName').val('')
    $('#boardPins').val('')
  }

  fetchData () {
    $.ajax({
      url: '/api/boards',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({boards: data})
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  addBoard () {
    $.ajax({
      url: '/api/boards',
      type: 'PUT',
      data: JSON.stringify({
        name: $('#boardName').val(),
        pins: Number($('#boardPins').val())
      }),
      success: function (data) {
        this.fetchData()
        this.toggleAddBoardDiv()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  deleteBoard (ev) {
    var boardID = ev.target.id
    $.ajax({
      url: '/api/boards/' + boardID,
      type: 'DELETE',
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  boardList () {
    var list = []
    $.each(this.state.boards, function (k, v) {
      list.push(
        <li key={k} className='list-group-item row'>
          <div className='col-sm-7'>
            {v.name}
          </div>
          <div className='col-sm-1'>
            <input type='button' value='delete' id={v.id} onClick={this.deleteBoard} className='btn btn-outline-danger' />
          </div>
        </li>
        )
    }.bind(this))
    return list
  }

  render () {
    var dStyle = {
      display: this.state.addBoard ? 'block' : 'none'
    }
    return (
      <div>
        <ul className='list-group'>
          { this.boardList() }
        </ul>
        <input type='button' value={this.state.addBoard ? '-' : '+'} onClick={this.toggleAddBoardDiv} className='btn btn-outline-success' />
        <div style={dStyle} className='row'>
          <div className='col-sm-1'>
              Name
            </div>
          <div className='col-sm-1'>
            <input type='text' id='boardName' className='form-control' />
          </div>
          <div className='col-sm-1'>
              Pins
            </div>
          <div className='col-sm-1'>
            <input type='text' id='boardPins' className='form-control' />
          </div>
          <input type='button' value='add' onClick={this.addBoard} className='btn btn-outline-primary' />
        </div>
      </div>
    )
  }
}
