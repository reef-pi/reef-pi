import Common from '../common.jsx'
import $ from 'jquery'
import React from 'react'
import Pump from './pump.jsx'
import New from './new.jsx'

export default class Doser extends Common {
  constructor (props) {
    super(props)
    this.state = {
      dosers: [],
      add: false
    }
    this.toggle = this.toggle.bind(this)
    this.fetch = this.fetch.bind(this)
    this.pumpList = this.pumpList.bind(this)
    this.update = this.update.bind(this)
  }

  update() {
  }


  componentWillMount () {
    this.fetch()
  }

  pumpList () {
    var pumps = []
    $.each(this.state.pumps, function (i, pump) {
      pumps.push(
        <div key={'pump-' + i} className='row list-group-item'>
          <Pump data={pump} updateHook={this.fetch} />
        </div>
      )
    }.bind(this))
    return (<ul className='list-group'> {pumps} </ul>)
  }

  fetch () {
    this.ajaxGet({
      url: '/api/doser/pumps',
      success: function (data) {
        this.setState({
          pumps: data
        })
      }.bind(this)
    })
  }


  render () {
    return (
      <div className='container'>
        {super.render()}
        <div className='container'>
          { this.pumpList() }
        </div>
        <New updateHook={this.fetch}/>
      </div>
    )
  }
}
