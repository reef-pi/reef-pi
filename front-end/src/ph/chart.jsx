import React from 'react'
import { ParseTimestamp, filterToday, timestampToEpoch, formatChartTime } from 'utils/timestamp'
import { ResponsiveContainer, Tooltip, YAxis, XAxis, LineChart, Line, ReferenceLine } from 'recharts'
import { fetchProbeReadings } from 'redux/actions/phprobes'
import { connect } from 'react-redux'
import { TwoDecimalParse } from 'utils/two_decimal_parse'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetchProbeReadings(this.props.probe_id)
    const timer = window.setInterval(() => {
      this.props.fetchProbeReadings(this.props.probe_id)
    }, 10 * 1000)
    this.setState({ timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (this.props.config === undefined) {
      return (<div />)
    }
    if (this.props.readings === undefined) {
      return (<div />)
    }
    const raw = this.props.type === 'current'
      ? filterToday(this.props.readings[this.props.type])
      : [...this.props.readings[this.props.type]]
    const metrics = raw.sort((a, b) => {
      return ParseTimestamp(a.time) > ParseTimestamp(b.time) ? 1 : -1
    }).map(m => ({ ...m, ts: timestampToEpoch(m.time) }))
    let current = ''
    if (metrics.length >= 1) {
      current = metrics[metrics.length - 1].value
      if (current !== '') {
        current = TwoDecimalParse(current)
      }
    }
    const c = this.props.config.chart
    const notify = this.props.config.notify
    const showMin = notify && notify.enable && notify.min > 0
    const showMax = notify && notify.enable && notify.max > 0
    return (
      <div className='container'>
        <span className='h6'>{this.props.config.name}({current})</span>
        <ResponsiveContainer height={this.props.height}>
          <LineChart data={metrics}>
            <Line dataKey='value' stroke={c.color} isAnimationActive={false} dot={false} />
            <XAxis dataKey='ts' type='number' scale='time' domain={['auto', 'auto']} tickFormatter={formatChartTime} />
            <Tooltip formatter={(value, name) => [TwoDecimalParse(value), c.unit]} />
            <YAxis dataKey='value' domain={[c.ymin, c.ymax]} />
            {showMin && (
              <ReferenceLine
                y={notify.min}
                stroke='orange'
                strokeDasharray='4 2'
                label={{ value: `Min: ${notify.min}`, position: 'insideBottomRight', fontSize: 11, fill: 'orange' }}
              />
            )}
            {showMax && (
              <ReferenceLine
                y={notify.max}
                stroke='orange'
                strokeDasharray='4 2'
                label={{ value: `Max: ${notify.max}`, position: 'insideTopRight', fontSize: 11, fill: 'orange' }}
              />
            )}
          </LineChart>
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

const mapDispatchToProps = (dispatch) => {
  return {
    fetchProbeReadings: (id) => dispatch(fetchProbeReadings(id))
  }
}

const Chart = connect(mapStateToProps, mapDispatchToProps)(chart)
export { chart as RawPhChart }
export default Chart
