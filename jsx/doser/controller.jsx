import $ from 'jquery'
import React from 'react'
import Pump from './pump.jsx'
import New from './new.jsx'
import {hideAlert} from '../utils/alert.js'
import {ajaxGet} from '../utils/ajax.js'

export default class Doser extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dosers: [],
      add: false
    }
    this.fetch = this.fetch.bind(this)
    this.pumpList = this.pumpList.bind(this)
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
    ajaxGet({
      url: '/api/doser/pumps',
      success: function (data) {
        this.setState({
          pumps: data
        })
        hideAlert()
      }.bind(this)
    })
  }

  render () {
    return (
      <div className='container'>
        <div className='container'>
          { this.pumpList() }
        </div>
        <New updateHook={this.fetch}/>
      </div>
    )
  }
}
