import React from 'react'
import {ResponsiveContainer, Tooltip, XAxis, BarChart, Bar} from 'recharts'
import $ from 'jquery'
import {fetchEquipments} from '../redux/actions/equipment'
import {connect} from 'react-redux'

class chart extends React.Component {
  componentDidMount () {
    this.props.fetchEquipments()
    var timer = window.setInterval(this.props.fetchEquipments, 10 * 1000)
    this.setState({timer: timer})
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    if (this.props.equipments === undefined) {
      return (<div />)
    }
    var equipments = []
    $.each(this.props.equipments, function (i, eq) {
      eq.onstate = eq.on ? 1 : 0
      eq.offstate = eq.on ? 0 : -1
      equipments.push(eq)
    })
    return (
      <div className='container'>
        <span className='h6'>Equipment</span>
        <ResponsiveContainer height={this.props.height} width='100%'>
          <BarChart data={equipments}>
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
    equipments: state.equipments
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchEquipments: () => dispatch(fetchEquipments())
  }
}

const Chart = connect(mapStateToProps, mapDispatchToProps)(chart)
export default Chart
