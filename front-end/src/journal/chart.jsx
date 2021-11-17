import React from 'react'
import { ResponsiveContainer, Tooltip, YAxis, XAxis, LineChart, Line } from 'recharts'
import { fetchJournalUsage } from 'redux/actions/journal'
import { connect } from 'react-redux'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetch(this.props.journal_id)
    const timer = window.setInterval(() => {
      this.props.fetch(this.props.journal_id)
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
    const metrics = this.props.readings.current
    let current = ''
    if (metrics.length >= 1) {
      current = metrics[metrics.length - 1].value
    }
    return (
      <div className='container'>
        <span className='h6'>{this.props.config.name}({current})</span>
        <ResponsiveContainer height={this.props.height}>
          <LineChart data={metrics}>
            <Line dataKey='value' isAnimationActive={false} dot={false} />
            <XAxis dataKey='timestamp' />
            <Tooltip formatter={(value, name) => [value, this.props.config.unit]} />
            <YAxis dataKey='value' />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.journals.find((j) => j.id === ownProps.journal_id),
    readings: state.journal_usage[ownProps.journal_id]
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: (id) => dispatch(fetchJournalUsage(id))
  }
}

const Chart = connect(mapStateToProps, mapDispatchToProps)(chart)
export default Chart
