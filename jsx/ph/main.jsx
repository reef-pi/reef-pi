import React from 'react'
import $ from 'jquery'
import Probe from './probe.jsx'
import New from './new.jsx'
import {fetchPhProbes, createProbe} from '../redux/actions/phprobes'
import {connect} from 'react-redux'

class ph extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.probeList = this.probeList.bind(this)
  }

  componentDidMount () {
    this.props.fetchPhProbes()
  }

  probeList () {
    var list = []
    var index = 0
    $.each(this.props.probes, function (k, v) {
      list.push(
        <div key={k} className='list-group-item'>
          <Probe data={v} upateHook={this.props.fetchPhProbes} />
        </div>
      )
      index = index + 1
    }.bind(this))
    return list
  }

  render () {
    return (
      <div className='container'>
        <ul className='list-group list-group-flush'>
          {this.probeList()}
        </ul>
        <New hook={this.props.createProbe} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    probes: state.phprobes
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPhProbes: () => dispatch(fetchPhProbes()),
    createProbe: (p) => dispatch(createProbe(p))
  }
}

const Ph = connect(mapStateToProps, mapDispatchToProps)(ph)
export default Ph
