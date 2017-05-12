import React from 'react'
import $ from 'jquery'
import MenuItem from 'react-bootstrap'
import Equipment from './equipment.jsx'

export default class Equipments extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedOutlet: undefined,
      outlets: [],
      equipments: []
    }
    this.setOutlet = this.setOutlet.bind(this)
    this.outletList = this.outletList.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
  }

  equipmentList () {
    var list = []
    $.each(this.state.equipments, function (k, v) {
      list.push(
        <li key={k} className='list-group-item'>
          <Equipment id={v.id} name={v.name} on={v.on} updateHook={this.fetchData} />
        </li>
            )
    }.bind(this))
    return list
  }

  fetchData () {
    $.ajax({
      url: '/api/equipments',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          equipments: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
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

  componentDidMount () {
    this.fetchData()
  }

  setOutlet (i, ev) {
    this.setState({
      selectedOutlet: i
    })
  }

  outletList () {
    var menuItems = []
    $.each(this.state.outlets, function (i, v) {
      if (v.equipment === '') {
        menuItems.push(<MenuItem key={i} eventKey={i}>{v.name}</MenuItem>)
      }
    })
    return menuItems
  }

  render () {
    return (
      <ul className='list-group'>
        {this.equipmentList()}
      </ul>
    )
  }
}
