import React from 'react'
import {Tooltip, YAxis, XAxis, LineChart, Line} from 'recharts'
import {ajaxGet} from '../utils/ajax.js'

export default class Chart extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      readings: []
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
      url: '/api/phprobes/'+this.props.id+'/readings',
      success: function (data) {
        this.setState({
          readings: data,
        })
      }.bind(this)
    })
  }
  render () {
    if (this.state.readings.length <= 0) {
      return (<div />)
    }
    return (
      <div className='container'>
        <span className='h6'>Readings</span>
        <LineChart width={this.props.width} height={this.props.height} data={this.state.readings.Current}>
          <Line dataKey='Ph' fill='#33b5e5' isAnimationActive={false} />
          <XAxis dataKey='Time' />
          <Tooltip />
        </LineChart>
      </div>
    )
  }
}
