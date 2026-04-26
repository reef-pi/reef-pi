import React from 'react'
import { connect } from 'react-redux'
import { ParseTimestamp, filterToday, timestampToEpoch, formatChartTime } from 'utils/timestamp'
import { ResponsiveContainer, Tooltip, YAxis, XAxis, LineChart, Line, ReferenceLine } from 'recharts'
import { fetchFlowMeterReadings } from 'redux/actions/flow_meters'
import { TwoDecimalParse } from 'utils/two_decimal_parse'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetchReadings(this.props.meter_id)
    const timer = window.setInterval(() => {
      this.props.fetchReadings(this.props.meter_id)
    }, 10 * 1000)
    this.setState({ timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (!this.props.readings) return <div />

    const raw = filterToday(this.props.readings.current || [])
    const metrics = raw.sort((a, b) =>
      ParseTimestamp(a.time) > ParseTimestamp(b.time) ? 1 : -1
    ).map(m => ({ ...m, ts: timestampToEpoch(m.time) }))

    let current = ''
    if (metrics.length >= 1) {
      current = TwoDecimalParse(metrics[metrics.length - 1].value)
    }

    const notify = this.props.notify
    const showMin = notify && notify.enable && notify.min > 0

    return (
      <div className='container'>
        <span className='h6'>{this.props.name} ({current} L/h)</span>
        <ResponsiveContainer height={this.props.height || 200}>
          <LineChart data={metrics}>
            <Line dataKey='value' stroke='#1da8d1' isAnimationActive={false} dot={false} />
            <XAxis dataKey='ts' type='number' scale='time' domain={['auto', 'auto']} tickFormatter={formatChartTime} />
            <Tooltip formatter={(value) => [TwoDecimalParse(value), 'L/h']} />
            <YAxis dataKey='value' />
            {showMin && (
              <ReferenceLine y={notify.min} stroke='orange' strokeDasharray='4 2' label='Min' />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  readings: state.flow_meter_readings[ownProps.meter_id]
})

const mapDispatchToProps = dispatch => ({
  fetchReadings: id => dispatch(fetchFlowMeterReadings(id))
})

const Chart = connect(mapStateToProps, mapDispatchToProps)(chart)
export default Chart
