import React from 'react'
import { Area, Tooltip, YAxis, XAxis, AreaChart, ResponsiveContainer } from 'recharts'
import { fetchTCUsage } from '../redux/actions/tcs'
import { connect } from 'react-redux'
import i18next from 'i18next'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetch(this.props.sensor_id)
    const timer = window.setInterval(() => { this.props.fetch(this.props.sensor_id) }, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (this.props.usage === undefined) {
      return (<div />)
    }
    if (this.props.config === undefined) {
      return (<div />)
    }
    let currentTemp = ''
    if (this.props.usage.current.length > 1) {
      currentTemp = this.props.usage.current[this.props.usage.current.length - 1].value
    }
    const c = this.props.config.chart
    return (
      <div className='container'>
        <span className='h6'>{this.props.config.name} - {i18next.t('temperature:temperature')} ({parseFloat(currentTemp).toFixed(1)})</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <AreaChart data={this.props.usage.current}>
            <defs>
              <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#00C851' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#007E33' stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis dataKey='value' domain={[c.ymin, c.ymax]} />
            <XAxis dataKey='time' />
            <Tooltip formatter={(value) => parseFloat(value).toFixed(1)} />    // *** display only 1 decimal - JFR 20201107
            <Area
              type='linear'
              dataKey='value'
              stroke='#007E33'
              isAnimationActive={false}
              fillOpacity={1}
              fill='url(#gradient)'
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.tcs.find((el) => { return el.id === ownProps.sensor_id }),
    usage: state.tc_usage[ownProps.sensor_id]
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: (id) => dispatch(fetchTCUsage(id))
  }
}

const ReadingsChart = connect(mapStateToProps, mapDispatchToProps)(chart)
export default ReadingsChart
