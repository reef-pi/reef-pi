import React from 'react'
import {XAxis, BarChart, Bar} from 'recharts'
import Common from './common.jsx'
import $ from 'jquery'

export default class EquipmentsChart extends Common {
  constructor (props) {
    super(props)
    this.state = {
      equipments: []
    }
    this.fetch = this.fetch.bind(this)
  }

  componentDidMount () {
    var timer = window.setInterval(this.fetch, 10 * 1000)
    this.setState({timer: timer})
    this.fetch()
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }

  fetch () {
    this.ajaxGet({
      url: '/api/equipments',
      success: function (data) {
        this.setState({
          equipments: $.each(data, function (i, eq) {
            eq.onstate = eq.on ? 1 : 0
            eq.offstate = eq.on ? 0 : -1
            return eq
          }),
          showAlert: false
        })
      }.bind(this)
    })
  }

  render () {
    if (this.state.equipments.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        {super.render()}
        <span className='h6'>Equipments</span>
        <BarChart width={this.props.width} height={this.props.height} data={this.state.equipments}>
          <Bar dataKey='onstate' stackId='a' fill='#00c851' isAnimationActive={false} />
          <Bar dataKey='offstate' stackId='a' fill='#ff4444' isAnimationActive={false} />
          <XAxis dataKey='name' />
        </BarChart>
      </div>
    )
  }
}
