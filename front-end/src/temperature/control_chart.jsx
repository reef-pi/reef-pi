import React from 'react'
import { Tooltip, ResponsiveContainer, ComposedChart, Line, YAxis, XAxis, Bar, ReferenceLine } from 'recharts'
import { fetchTCUsage } from '../redux/actions/tcs'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { TwoDecimalParse } from 'utils/two_decimal_parse'
import { PercentOf } from 'utils/percent_of'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetchTCUsage(this.props.sensor_id)
    const timer = window.setInterval(() => {
      this.props.fetchTCUsage(this.props.sensor_id)
    }, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (this.props.config === undefined) {
      return <div />
    }
    if (this.props.usage === undefined) {
      return <div />
    }
    const usage = []
    this.props.usage.historical.forEach((v, i) => {
      v.cooler *= -1
      usage.push(v)
    })

    const c = this.props.config.chart
    const unit = this.props.config.fahrenheit ? '°F' : '°C'
    return (
      <div className='container'>
        <span className='h6'>
          {this.props.config.name} - {i18next.t('temperature:heater_cooler')}
        </span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <ComposedChart data={usage}>
            <YAxis
              dataKey='value'
              type='number'
              yAxisId='left'
              orientation='left'
              domain={[c.ymin, c.ymax]}
              allowDecimals='false'
            />
            <YAxis yAxisId='right' orientation='right' />
            <ReferenceLine yAxisId='right' y={0} />
            <XAxis dataKey='time' />
            <Tooltip formatter={(value, name) => formatLegend(value, name, unit)} />
            <Bar dataKey='up' fill='#ffbb33' isAnimationActive={false} yAxisId='right' stackId='t' />
            <Bar dataKey='down' fill='#33b5e5' isAnimationActive={false} yAxisId='right' stackId='t' />
            <Line
              type='monotone'
              stroke={this.props.config.chart.color}
              isAnimationActive={false}
              yAxisId='left'
              dot={false}
              dataKey='value'
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const formatLegend = (value, name, unit) => {
  if (name==='value') {
    return [TwoDecimalParse(value), unit]
  }
  else {
    return [PercentOf(value,3600) + '%', i18next.t('temperature:chart:' + name)]
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    config: state.tcs.find(el => {
      return el.id === ownProps.sensor_id
    }),
    usage: state.tc_usage[ownProps.sensor_id]
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchTCUsage: id => dispatch(fetchTCUsage(id))
  }
}

const ControlChart = connect(
  mapStateToProps,
  mapDispatchToProps
)(chart)
export default ControlChart
