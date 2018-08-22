import React from 'react'
import {ResponsiveContainer, Tooltip, XAxis, BarChart, Bar} from 'recharts'
import $ from 'jquery'
import {fetchEquipment} from '../redux/actions/equipment'
import {connect} from 'react-redux'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetchEquipment()
    var timer = window.setInterval(this.props.fetchEquipment, 10 * 1000)
    this.setState({timer: timer})
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (this.props.equipment === undefined) {
      return (<div />)
    }
    var equipment = []
    $.each(this.props.equipment, function (i, eq) {
      eq.onstate = eq.on ? 1 : 0
      eq.offstate = eq.on ? 0 : -1
      equipment.push(eq)
    })
    return (
      <div className='container'>
        <span className='h6'>Equipment</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <BarChart data={equipment}>
            <Bar dataKey='onstate' stackId='a' fill='#00c851' isAnimationActive={false} />
            <Bar dataKey='offstate' stackId='a' fill='#ff4444' isAnimationActive={false} />
            <XAxis dataKey='name' />
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    equipment: state.equipment
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchEquipment: () => dispatch(fetchEquipment())
  }
}

const Chart = connect(mapStateToProps, mapDispatchToProps)(chart)
export default Chart
