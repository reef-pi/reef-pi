import React from 'react'
import $ from 'jquery'
import Sensor from './sensor.jsx'
import New from './new.jsx'
import {ajaxGet} from '../utils/ajax.js'

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      tcs: [],
      add: false
    }
    this.fetch = this.fetch.bind(this)
    this.list = this.list.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  fetch(){
    ajaxGet({
      url: '/api/tcs',
      success: function (data) {
        this.setState({
          tcs: data,
        })
      }.bind(this)
    })
  }

  list() {
    var list = []
    var index = 0
    $.each(this.state.tcs, function (k, v) {
      list.push(
        <div key={k} className='row list-group-item'>
          <Sensor data={v} upateHook={this.fetch}/>
        </div>
       )
      index = index + 1
    }.bind(this))
    return list
  }

  render() {
    return(
      <div className='container'>
        <ul className='list-group'>
          {this.list()}
        </ul>
        <New updateHook={this.fetch}/>
      </div>
    )
  }
}
