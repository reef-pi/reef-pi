import React from 'react'
import { ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts'
import { fetchLightUsage } from 'redux/actions/lights'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { TwoDecimalParse } from 'utils/two_decimal_parse'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetch(this.props.light_id)
    const timer = window.setInterval(() => { this.props.fetch(this.props.light.id) }, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (this.props.usage === undefined) {
      return (<span>{i18next.t('loading')}</span>)
    }
    const l = this.props.light
    if (l === undefined) {
      return (<span>{i18next.t('loading')}</span>)
    }

    const lines = []
    Object.entries(l.channels).forEach(([k, ch]) => {
      lines.push(
        <Line
          type='monotone'
          dataKey={ch.name}
          stroke={ch.color}
          key={ch.name}
          isAnimationActive={false}
          dot={false}
        />)
    })

    const usage = this.props.usage.current

    usage.forEach((v, i) => {
      Object.entries(v.channels).forEach(([ch, v]) => {
        usage[i][ch] = v
      })
    })
    return (
      <div className='container'>
        <span className='h6'>{l.name}</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <LineChart data={usage}>
            <YAxis />
            <XAxis dataKey='time' />
            <Tooltip formatter={(value, name) => [TwoDecimalParse(value)]} />
            {lines}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    light: state.lights.find((el) => { return el.id === ownProps.light_id }),
    usage: state.light_usage[ownProps.light_id]
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: (id) => dispatch(fetchLightUsage(id))
  }
}

const GenericLightChart = connect(mapStateToProps, mapDispatchToProps)(chart)
export default GenericLightChart
