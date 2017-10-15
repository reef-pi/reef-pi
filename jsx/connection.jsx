import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import Common from './common.jsx'

export default class Connection extends Common {
  constructor (props) {
    super(props)
    this.state = {
      boards: [],
      board: 0,
      type: 'switch',
      pin: 0
    }
    this.fetchBoards = this.fetchBoards.bind(this)
    this.boardList = this.boardList.bind(this)
    this.pinList = this.pinList.bind(this)
    this.setBoard = this.setBoard.bind(this)
    this.setPin = this.setPin.bind(this)
    this.setType = this.setType.bind(this)
  }

  componentDidMount () {
    this.fetchBoards()
  }

  fetchBoards () {
    this.ajaxGet({
      url: '/api/boards',
      success: function (data) {
        this.setState({
          boards: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })
  }

  setBoard (k, ev) {
    this.setState({
      board: Number(k)
    })
    var payload = {
      board: this.state.boards[k].id,
      type: this.state.type,
      pin: this.state.pin
    }
    this.props.updateHook(payload)
  }

  setPin (k, ev) {
    this.setState({
      pin: Number(k)
    })
    var payload = {
      board: this.state.boards[this.state.board].id,
      type: this.state.type,
      pin: Number(k)
    }
    this.props.updateHook(payload)
  }
  setType (k, ev) {
    this.setState({
      type: k
    })
    var payload = {
      board: this.state.boards[this.state.board].id,
      pin: this.state.pin,
      type: k
    }
    this.props.updateHook(payload)
  }

  boardList () {
    var list = []
    $.each(this.state.boards, function (k, v) {
      list.push(<MenuItem key={v.name} eventKey={k}> {v.name}</MenuItem>)
    })
    return list
  }

  pinList () {
    var list = []
    if (this.state.boards.length === 0) {
      return list
    }
    var l = this.state.boards[this.state.board].pins
    for (var i = 1; i <= l; i++) {
      list.push(<MenuItem key={i} eventKey={i}> {i}</MenuItem>)
    }
    return list
  }

  render () {
    var boardName = ''
    if (this.state.boards[this.state.board] !== undefined) {
      boardName = this.state.boards[this.state.board].name
    }
    return (
      <div className='row'>
        {super.render()}
        <div className='col-sm-2'>
              Board
            </div>
        <div className='col-sm-3'>
          <DropdownButton title={boardName} id='board-name' onSelect={this.setBoard}>
            {this.boardList()}
          </DropdownButton>
        </div>
        <div className='col-sm-1'>
              Pin
            </div>
        <div className='col-sm-2'>
          <DropdownButton title={this.state.pin} id='pin-number' onSelect={this.setPin}>
            {this.pinList()}
          </DropdownButton>
        </div>
        <div className='col-sm-2'>
              Type
            </div>
        <div className='col-sm-2'>
          <DropdownButton title={this.state.type} id='pin-type' onSelect={this.setType}>
            <MenuItem key='pwm' eventKey='pwm'>pwm</MenuItem>
            <MenuItem key='switch' eventKey='switch'>switch</MenuItem>
          </DropdownButton>
        </div>
      </div>
    )
  }
}
