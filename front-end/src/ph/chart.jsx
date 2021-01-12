import React from 'react'
import { ResponsiveContainer, Tooltip, YAxis, XAxis, LineChart, Line } from 'recharts'
import { fetchProbeReadings } from 'redux/actions/phprobes'
import { connect } from 'react-redux'

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
      return (<div />)
    }
    if (this.props.readings === undefined) {
      return (<div />)
    }
    const metrics = this.props.readings[this.props.type]
    let current = ''
    if (metrics.length >= 1) {
      current = metrics[metrics.length - 1].value
      // *** display only 2 decimals - JFR 20201101 
      // *** restored 20210112 after upstream update
      if (current !== '') {
        current = parseFloat(current).toFixed(2);
      }
    }
    const c = this.props.config.chart
    return (
      <div className='container'>
        <span className='h6'>{this.props.config.name}-{this.props.type} ({current})</span>
        <ResponsiveContainer height={this.props.height}>
          <LineChart data={metrics}>
            <Line dataKey='value' stroke={c.color} isAnimationActive={false} dot={false} />
            <XAxis dataKey='time' />
            <Tooltip formatter={(value) => parseFloat(value).toFixed(2)} />    // *** display only 2 decimals - JFR 20201031 restored 20210112 after upstream update
            <YAxis dataKey='value' domain={[c.ymin, c.ymax]} label={c.unit} />
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
