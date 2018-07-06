import React from 'react'
import {ResponsiveContainer, Tooltip, YAxis, XAxis, LineChart, Line} from 'recharts'
import {fetchProbeReadings} from '../redux/actions/phprobes'
import {connect} from 'react-redux'

class chart extends React.Component {
  componentDidMount () {
    var timer = window.setInterval(this.fetchProbeReadings, 10 * 1000)
    this.setState({timer: timer})
    this.props.fetchProbeReadings(this.props.probe_id)
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
    var metrics = this.props.readings[this.props.type]
    return (
      <div className='container'>
        <span className='h6'>{this.props.config.name}-{this.props.type} pH</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <LineChart
            data={metrics}
          >
            <Line dataKey='pH' stroke='#33b5e5' isAnimationActive={false} dot={false} />
            <XAxis dataKey='time' />
            <Tooltip />
            <YAxis />
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
export default Chart
