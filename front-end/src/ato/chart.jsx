import React from 'react'
import { ResponsiveContainer, Tooltip, YAxis, XAxis, BarChart, Bar } from 'recharts'
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
        <span className='h6'>{i18next.t('ato:ato_usage')}</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <BarChart data={this.props.usage.historical}>
            <Bar dataKey='pump' fill='#33b5e5' isAnimationActive={false} />
            <YAxis label='seconds' />
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
