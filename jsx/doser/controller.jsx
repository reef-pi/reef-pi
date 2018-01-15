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
    this.remove = this.remove.bind(this)
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
        <div key={'pump-' + i} className='row'>
          <div className='col-sm-4'><Pump data={pump}/></div>
          <div className='col-sm-1'>
            <input type='button' id={'remove-pump-' + pump.id} onClick={this.remove(pump.id)} value='delete' className='btn btn-outline-danger col-sm-2' />
          </div>
        </div>
      )
    }.bind(this))
    return (pumps)
  }

  fetch () {
    this.setState({
      pumps: [{name: 'Two Part - A', id: '1'}]
    })
    /*
    this.ajaxGet({
      url: '/api/doser/pumps',
      success: function (data) {
        this.setState({
          pumps: data
        })
      }.bind(this)
    })
    */
  }


  remove (id) {
    return (function () {
      this.confirm('Are you sure ?')
      .then(function () {
        this.ajaxDelete({
          url: '/api/dosers/' + id,
          type: 'DELETE',
          success: function (data) {
            this.fetch()
          }.bind(this)
        })
      }.bind(this))
    }.bind(this))
  }

  render () {
    return (
      <div className='container'>
        {super.render()}
        <div className='container'>
          { this.pumpList() }
        </div>
        <New />
      </div>
    )
  }
}
