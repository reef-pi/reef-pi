import React from 'react'
import { ResponsiveContainer, Tooltip, XAxis, BarChart, Bar } from 'recharts'
import { fetchEquipment } from '../redux/actions/equipment'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { EQUIPMENT_POLL_INTERVAL_MS } from './utils'

class CustomToolTip extends React.Component {
  render () {
    if (this.props.payload === undefined) {
      return <span />
    }
    const el = this.props.payload[0]
    if (el === undefined) {
      return <span />
    }
    if (el.dataKey === 'onstate') {
      return (<span>{i18next.t('on')}</span>)
    }
    return (<span>{i18next.t('off')}</span>)
  }
}

export class ChartView extends React.Component {
  componentDidMount () {
    this.props.fetchEquipment()
    this.timer = window.setInterval(this.props.fetchEquipment, EQUIPMENT_POLL_INTERVAL_MS)
  }

  componentWillUnmount () {
    window.clearInterval(this.timer)
  }

  render () {
    if (this.props.equipment === undefined) {
      return <div />
    }
    const equipment = this.props.equipment.map(eq => ({
      ...eq,
      onstate: eq.on ? 1 : undefined,
      offstate: eq.on ? undefined : 1
    }))
    return (
      <div className='container'>
        <span className='h6'>{i18next.t('capabilities:equipment')}</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <BarChart data={equipment}>
            <Bar dataKey='onstate' fill='#00c851' isAnimationActive={false} stackId='a' />
            <Bar dataKey='offstate' fill='#ff4444' isAnimationActive={false} stackId='a' />
            <XAxis dataKey='name' />
            <Tooltip content={<CustomToolTip />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    equipment: state.equipment
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchEquipment: () => dispatch(fetchEquipment())
  }
}

const EquipmentChart = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartView)
export default EquipmentChart
