import React from 'react'
import {ComposedChart, Line, Tooltip, YAxis, XAxis, Bar, ReferenceLine} from 'recharts'
import $ from 'jquery'
import {fetchTCUsage} from '../redux/actions/tcs'
import {connect} from 'react-redux'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetchTCUsage(this.props.sensor_id)
    var timer = window.setInterval(() => {
      this.props.fetchTCUsage(this.props.sensor_id)
      }, 10 * 1000)
    this.setState({timer: timer})
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }


  render () {
    if (this.props.config === undefined) {
      return (<div />)
    }
    if (this.props.usage === undefined) {
      return (<div />)
    }
    var usage = []
    $.each(this.props.usage.historical, function (i, v) {
      v.cooler *= -1
      usage.push(v)
    })
    var min = 72
    var max = 86
    if (this.props.config.chart_min !== undefined) {
      min = this.props.config.chart_min
    }
    if (this.props.config.chart_max !== undefined) {
      max = this.props.config.chart_max
    }

    return (
      <div className='container'>
        <span className='h6'>{this.props.config.name} - Heater/Cooler</span>
        <ComposedChart width={this.props.width} height={this.props.height} data={usage}>
          <YAxis yAxisId='left' orientation='left' domain={[min, max]} />
          <YAxis yAxisId='right' orientation='right' />
          <ReferenceLine yAxisId='right' y={0} />
          <XAxis dataKey='time' />
          <Tooltip />
          <Bar dataKey='heater' fill='#ffbb33' isAnimationActive={false} yAxisId='right' stackId='t' />
          <Bar dataKey='cooler' fill='#33b5e5' isAnimationActive={false} yAxisId='right' stackId='t' />
          <Line type='monotone' dataKey='temperature' stroke='#ce93d8' isAnimationActive={false} yAxisId='left' dot={false} />
        </ComposedChart>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.tcs.find((el)=>{ return el.id === ownProps.sensor_id}),
    usage: state.tc_usage[ownProps.sensor_id]
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTCUsage: (id) => dispatch(fetchTCUsage(id))
  }
}

const ControlChart = connect(mapStateToProps, mapDispatchToProps)(chart)
export default ControlChart
