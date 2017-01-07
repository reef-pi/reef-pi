import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export default class Inlets extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addInlet: false,
      inletType: '',
      inlets: []
    }
    this.fetchData = this.fetchData.bind(this)
    this.inletList = this.inletList.bind(this)
    this.addInlet = this.addInlet.bind(this)
    this.removeInlet = this.removeInlet.bind(this)
    this.toggleAddInletDiv = this.toggleAddInletDiv.bind(this)
    this.setInletType = this.setInletType.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  setInletType (key, ev) {
    this.setState({
      inletType: key
    })
  }

  toggleAddInletDiv () {
    this.setState({
      addInlet: !this.state.addInlet
    })
  }

  fetchData () {
    $.ajax({
      url: '/api/inlets',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({inlets: data})
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  inletList () {
    var list = []
    $.each(this.state.inlets, function (k, v) {
      list.push(
        <li key={k} className='list-group-item row'>
          <div className='col-sm-7'>
            {v.name}
          </div>
          <div className='col-sm-1'>
            <input type='button' value='delete' id={'inlet-' + v.id} onClick={this.removeInlet} className='btn btn-outline-danger' />
          </div>
        </li>
        )
    }.bind(this))
    return list
  }

  addInlet () {
    $.ajax({
      url: '/api/inlets',
      type: 'PUT',
      data: JSON.stringify({
        name: $('#inletName').val(),
        pin: Number($('#inletPin').val()),
        type: this.state.inletType
      }),
      success: function (data) {
        this.fetchData()
        this.setState({
          addInlet: false
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  removeInlet (ev) {
    var inletID = ev.target.id.split('-')[1]
    $.ajax({
      url: '/api/inlets/' + inletID,
      type: 'DELETE',
      success: function (data) {
        this.fetchData()
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  render () {
    var dStyle = {
      display: this.state.addInlet ? 'block' : 'none'
    }
    return (
      <div className='container' >
        <ul className='list-group'>
          { this.inletList() }
        </ul>
        <div className='container'>
          <input className='btn btn-outline-success' type='button' value={this.state.addInlet ? '-' : '+'} onClick={this.toggleAddInletDiv} />
          <div className='container' style={dStyle}>
            <div className='row'>
              <label className='col-sm-3'>Name</label> <input type='text' id='inletName' className='col-sm-2' />
            </div>
            <div className='row'>
              <label className='col-sm-3'>Pin</label> <input type='text' id='inletPin' className='col-sm-2' />
            </div>
            <div className='row'>
              <label className='col-sm-3'>Type</label>
              <div className='col-sm-3'>
                <DropdownButton title={this.state.inletType} id='inletType' onSelect={this.setInletType}>
                  <MenuItem key='digital' eventKey='digital'> digital </MenuItem>
                  <MenuItem key='analog' eventKey='analog'> analog </MenuItem>
                </DropdownButton>
              </div>
            </div>
            <div className='row'>
              <input type='button' value='add' onClick={this.addInlet} className='btn btn-outline-primary' />
            </div>
          </div>
        </div>

      </div>
    )
  }
}
