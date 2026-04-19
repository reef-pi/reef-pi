import React from 'react'
import { ParseTimestamp, timestampToEpoch, formatChartTime } from 'utils/timestamp'
import { ResponsiveContainer, Line, Tooltip, YAxis, XAxis, LineChart } from 'recharts'
import { fetchHealth } from './redux/actions/health'
import { connect } from 'react-redux'
import i18next from 'i18next'

class healthChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      trend: this.props.trend !== undefined ? this.props.trend : 'current',
      timer: window.setInterval(props.fetchHealth, 60 * 1000)
    }
  }

  componentDidMount () {
    this.props.fetchHealth()
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (this.props.health_stats === undefined || this.props.health_stats.length <= 0) {
      return (<div />)
    }
    const healthStats = this.props.health_stats[this.state.trend]
    if (healthStats) {
      healthStats.sort((a, b) => {
        return ParseTimestamp(a.time) > ParseTimestamp(b.time) ? 1 : -1
      })
      healthStats.forEach((m, i) => { healthStats[i] = { ...m, ts: timestampToEpoch(m.time) } })
    }
    return (
      <div className='container'>
        <span className='h6'>{i18next.t('health_chart:cpu_memory')} ({i18next.t('health_chart:' + this.props.trend)})</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <LineChart data={healthStats}>
            <YAxis yAxisId='left' orientation='left' stroke='#00c851' />
            <YAxis yAxisId='right' orientation='right' stroke='#ffbb33' />
            <YAxis yAxisId='temp' orientation='right' stroke='#ff4444' />
            <XAxis dataKey='ts' type='number' scale='time' domain={['auto', 'auto']} tickFormatter={formatChartTime} />
            <Tooltip />
            <Line dot={false} type='linear' dataKey='cpu' stroke='#00c851' isAnimationActive={false} yAxisId='left' />
            <Line dot={false} type='linear' dataKey='memory' stroke='#ffbb33' isAnimationActive={false} yAxisId='right' />
            <Line dot={false} type='linear' dataKey='cpu_temp' stroke='#ff4444' isAnimationActive={false} yAxisId='temp' />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return { health_stats: state.health_stats }
}

const mapDispatchToProps = (dispatch) => {
  return { fetchHealth: () => dispatch(fetchHealth()) }
}
const HealthChart = connect(mapStateToProps, mapDispatchToProps)(healthChart)
export default HealthChart
