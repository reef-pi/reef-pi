import React from 'react'
import $ from 'jquery'
import Equipment from './equipment.jsx'

export default class Equipments extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      equipments: []
    }
    this.fetchData = this.fetchData.bind(this)
    this.equipmentList = this.equipmentList.bind(this)
  }

  equipmentList () {
    var list = []
    $.each(this.state.equipments, function (k, v) {
      list.push(
        <li key={k} className='list-group-item'>
          <Equipment id={v.id} name={v.name} on={v.on} outlet={v.outlet} value={v.value} />
        </li>
            )
    })
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
  }

  componentDidMount () {
    this.fetchData()
  }

  render () {
    return (
      <ul className='list-group'>
        {this.equipmentList()}
      </ul>
    )
  }
}
