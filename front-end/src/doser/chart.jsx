import React from 'react'
import { ResponsiveContainer, Tooltip, YAxis, XAxis, BarChart, Bar } from 'recharts'
import { fetchDoserUsage } from '../redux/actions/doser'
import { connect } from 'react-redux'
import i18next from 'i18next'

class chart extends React.Component {
  constructor (props) {
    super(props)
    this.updateUsage = this.updateUsage.bind(this)
  }

  updateUsage () {
    this.props.fetchDoserUsage(this.props.doser_id)
  }

  componentDidMount () {
    this.updateUsage()
    const timer = window.setInterval(this.updateUsage, 10 * 1000)
    this.setState({ timer: timer })
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
    return (
      <>
        <span className='h6'>{this.props.config.name} - {i18next.t('doser:doser_usage')}</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <BarChart data={this.props.usage.historical}>
            <Bar dataKey='pump' fill='#33b5e5' isAnimationActive={false} />
            <YAxis label={i18next.t('sec')} />
            <XAxis dataKey='time' />
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      </>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    usage: state.doser_usage[props.doser_id],
    config: state.dosers.find(p => p.id === props.doser_id)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDoserUsage: id => dispatch(fetchDoserUsage(id))
  }
}

const Chart = connect(
  mapStateToProps,
  mapDispatchToProps
)(chart)
export default Chart
