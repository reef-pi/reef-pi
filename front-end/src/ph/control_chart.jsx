import React from 'react'
import { ParseTimestamp } from 'utils/timestamp'
import { Tooltip, ResponsiveContainer, ComposedChart, Line, YAxis, XAxis, Bar, ReferenceLine } from 'recharts'
import { fetchProbeReadings } from 'redux/actions/phprobes'
import { connect } from 'react-redux'
import { TwoDecimalParse } from 'utils/two_decimal_parse'
import humanizeDuration from 'humanize-duration'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetchProbeReadings(this.props.probe_id)
    const timer = window.setInterval(() => {
      this.props.fetchProbeReadings(this.props.probe_id)
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
    if (this.props.readings === undefined) {
      return <div />
    }
    const metrics = this.props.readings.historical
    metrics.sort((a, b) => {
      return ParseTimestamp(a.time) < ParseTimestamp(b.time) ? 1 : -1
    })
    let current = ''
    if (metrics.length >= 1) {
      current = metrics[metrics.length - 1].value
      if (current !== '') {
        current = TwoDecimalParse(current)
      }
    }
    const c = this.props.config.chart
    return (
      <div className='container'>
        <span className='h6'>{this.props.config.name}({current})</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <ComposedChart data={metrics}>
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
            <Tooltip
              formatter={(value, name) => {
                switch (name) {
                  case 'value':
                    return [TwoDecimalParse(value), c.unit]
                  case 'up':
                    return humanizeDuration(value * 1000)
                  case 'down':
                    return humanizeDuration(value * 1000)
                }
              }}
            />
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

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.phprobes.find((p) => p.id === ownProps.probe_id),
    readings: state.ph_readings[ownProps.probe_id]
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchProbeReadings: (id) => dispatch(fetchProbeReadings(id))
  }
}

const ControlChart = connect(
  mapStateToProps,
  mapDispatchToProps
)(chart)
export default ControlChart
