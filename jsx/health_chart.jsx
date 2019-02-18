import React from 'react'
import {ResponsiveContainer, Line, Tooltip, YAxis, XAxis, LineChart} from 'recharts'
import {fetchHealth} from './redux/actions/health'
import {connect} from 'react-redux'
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
    var healthStats = this.props.health_stats[this.state.trend]
    return (
      <div className='container'>
        <span className='h6'>{i18next.t('health_chart:cpu_memory')} ({this.props.trend})</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <LineChart data={healthStats}>
            <YAxis yAxisId='left' orientation='left' stroke='#00c851' />
            <YAxis yAxisId='right' orientation='right' stroke='#ffbb33' />
            <XAxis dataKey='time' />
            <Tooltip />
            <Line dot={false} type='linear' dataKey='cpu' stroke='#00c851' isAnimationActive={false} yAxisId='left' />
            <Line dot={false} type='linear' dataKey='memory' stroke='#ffbb33' isAnimationActive={false} yAxisId='right' />
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
  return {fetchHealth: () => dispatch(fetchHealth())}
}
const HealthChart = connect(mapStateToProps, mapDispatchToProps)(healthChart)
export default HealthChart
