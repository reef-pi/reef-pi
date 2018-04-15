import React from 'react'
import $ from 'jquery'
import ATO from './ato.jsx'
import New from './new.jsx'
import {ajaxGet} from '../utils/ajax.js'

export default class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      atos: [],
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
      url: '/api/atos',
      success: function (data) {
        this.setState({
          atos: data,
        })
      }.bind(this)
    })
  }

  list() {
    var list = []
    var index = 0
    $.each(this.state.atos, function (k, v) {
      list.push(
        <div key={k} className='row list-group-item'>
          <ATO data={v} upateHook={this.fetch}/>
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
