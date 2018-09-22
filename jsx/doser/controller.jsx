import React from 'react'
import Pump from './pump'
import New from './new'
import { fetchDosingPumps } from 'redux/actions/doser'
import { connect } from 'react-redux'

class doser extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.pumpList = this.pumpList.bind(this)
  }

  componentWillMount () {
    this.props.fetchDosingPumps()
  }

  pumpList () {
    return (
      this.props.pumps.map((pump) => {
        return (
          <li key={Number(pump.id)} className='row list-group-item'>
            <Pump data={pump} />
          </li>)
      })
    )
  }

  render () {
    return (
      <ul className='list-group list-group-flush'>
        {this.pumpList()}
        <li className='list-group-item'>
          <New />
        </li>
      </ul>
    )
  }
}

const mapStateToProps = state => {
  return {
    pumps: state.dosers
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDosingPumps: () => dispatch(fetchDosingPumps())
  }
}

const Doser = connect(
  mapStateToProps,
  mapDispatchToProps
)(doser)
export default Doser
