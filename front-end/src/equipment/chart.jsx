import React from 'react'
import { ResponsiveContainer, Tooltip, XAxis, BarChart, Bar } from 'recharts'
import { fetchEquipment } from '../redux/actions/equipment'
import { connect } from 'react-redux'
import i18next from 'i18next'

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
      return (<span> On</span>)
    }
    return (<span> Off</span>)
  }
}

class chart extends React.Component {
  componentDidMount () {
    this.props.fetchEquipment()
    const timer = window.setInterval(this.props.fetchEquipment, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    window.clearInterval(this.state.timer)
  }

  render () {
    if (this.props.equipment === undefined) {
      return <div />
    }
    const equipment = []
    this.props.equipment.forEach((eq, i) => {
      if (eq.on) {
        eq.onstate = 1
      } else {
        eq.offstate = 1
      }
      equipment.push(eq)
    })
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
)(chart)
export default EquipmentChart
