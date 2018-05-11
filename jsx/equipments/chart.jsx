import React from 'react'
import {Tooltip, XAxis, BarChart, Bar} from 'recharts'
import $ from 'jquery'
import {ajaxGet} from '../utils/ajax.js'
import {hideAlert} from '../utils/alert.js'

export default class EquipmentsChart extends React.Component {
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
    ajaxGet({
      url: '/api/equipments',
      success: function (data) {
        this.setState({
          equipments: $.each(data, function (i, eq) {
            eq.onstate = eq.on ? 1 : 0
            eq.offstate = eq.on ? 0 : -1
            return eq
          })
        })
        hideAlert()
      }.bind(this)
    })
  }

  render () {
    if (this.state.equipments.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        <span className='h6'>Equipment</span>
        <BarChart width={this.props.width} height={this.props.height} data={this.state.equipments}>
          <Bar dataKey='onstate' stackId='a' fill='#00c851' isAnimationActive={false} />
          <Bar dataKey='offstate' stackId='a' fill='#ff4444' isAnimationActive={false} />
          <XAxis dataKey='name' />
          <Tooltip />
        </BarChart>
      </div>
    )
  }
}
