import React from 'react'
import $ from 'jquery'
import Probe from './probe.jsx'
import New from './new.jsx'
import {ajaxGet} from '../utils/ajax.js'

export default class Ph extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      probes: [],
      add: false
    }
    this.fetch = this.fetch.bind(this)
    this.probeList = this.probeList.bind(this)
  }

  componentDidMount () {
    this.fetch()
  }

  fetch(){
    ajaxGet({
      url: '/api/phprobes',
      success: function (data) {
        this.setState({
          probes: data,
        })
      }.bind(this)
    })
  }

  probeList() {
    var list = []
    var index = 0
    $.each(this.state.probes, function (k, v) {
      list.push(
        <div key={k} className='row list-group-item'>
          <Probe data={v} upateHook={this.fetch}/>
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
          {this.probeList()}
        </ul>
        <New updateHook={this.fetch}/>
      </div>
    )
  }
}
