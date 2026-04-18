import React from 'react'
import { ParseTimestamp, timestampToEpoch, formatChartTime } from 'utils/timestamp'
import { ResponsiveContainer, Tooltip, YAxis, XAxis, BarChart, Bar, Label } from 'recharts'
import { fetchATOUsage } from '../redux/actions/ato'
import { connect } from 'react-redux'
import i18next from 'i18next'

class chart extends React.Component {
  constructor (props) {
    super(props)
    this.updateUsage = this.updateUsage.bind(this)
  }

  updateUsage () {
    this.props.fetchATOUsage(this.props.ato_id)
  }

  componentDidMount () {
    this.updateUsage()
    const timer = window.setInterval(this.updateUsage, 10 * 1000)
    this.setState({ timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (this.props.usage === undefined) {
      return <div />
    }
    if (this.props.config === undefined) {
      return <div />
    }
    const metrics = this.props.usage.historical
      .sort((a, b) => ParseTimestamp(a.time) > ParseTimestamp(b.time) ? 1 : -1)
      .map(m => ({ ...m, ts: timestampToEpoch(m.time) }))
    return (
      <>
        <span className='h6'>{this.props.config.name}</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <BarChart data={metrics} barSize={8}>
            <Bar dataKey='pump' fill='#33b5e5' isAnimationActive={false} />
            <YAxis type='number'>
              <Label
                value={i18next.t('sec')}
                position='insideLeft'
                angle={-90}
                style={{ textAnchor: 'middle' }}
              />
            </YAxis>
            <XAxis dataKey='ts' type='number' scale='time' domain={['auto', 'auto']} tickFormatter={formatChartTime} />
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      </>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    usage: state.ato_usage[props.ato_id],
    config: state.atos.find(p => p.id === props.ato_id)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchATOUsage: id => dispatch(fetchATOUsage(id))
  }
}

const Chart = connect(
  mapStateToProps,
  mapDispatchToProps
)(chart)
export default Chart
