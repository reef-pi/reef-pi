import React from 'react'
import { Line, Tooltip, YAxis, XAxis, LineChart } from 'recharts'
import {fetchHealth} from './redux/actions/health'
import {connect} from 'react-redux'

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
    if(this.state && this.state.timer) {
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
        <span className='h6'>CPU/Memory ({this.props.trend})</span>
        <LineChart width={this.props.width} height={this.props.height} data={healthStats}>
          <YAxis yAxisId='left' orientation='left' stroke='#00c851' />
          <YAxis yAxisId='right' orientation='right' stroke='#ffbb33' />
          <XAxis dataKey='time' />
          <Tooltip />
          <Line dot={false} type='linear' dataKey='cpu' stroke='#00c851' isAnimationActive={false} yAxisId='left' />
          <Line dot={false} type='linear' dataKey='memory' stroke='#ffbb33' isAnimationActive={false} yAxisId='right' />
        </LineChart>
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
