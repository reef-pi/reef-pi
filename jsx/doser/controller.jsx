import React from 'react'
import Pump from './pump'
import New from './new'
import { fetchDosingPumps } from 'redux/actions/doser'
import { connect } from 'react-redux'
import $ from 'jquery'

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
    var pumps = []
    console.log(this.props)
    console.log(this.props.pumps)
    $.each(this.props.pumps, function (i, pump) {
      pumps.push(
        <div key={'pump-' + i} className='row list-group-item'>
          <Pump data={pump} />
        </div>
      )
    })
    return <ul className='list-group list-group-flush'> {pumps} </ul>
  }

  render () {
    return (
      <div className='container'>
        <div className='container'>{this.pumpList()}</div>
        <New />
      </div>
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

// const Doser = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(doser)
// export default Doser
export default connect(mapStateToProps, mapDispatchToProps)(doser)
