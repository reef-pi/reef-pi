import React from 'react'
import Probe from './probe'
import New from './new'
import { fetchPhProbes, createProbe } from 'redux/actions/phprobes'
import { connect } from 'react-redux'

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
    this.props.probes.forEach((v, k) => {
      list.push(
        <div key={k} className='list-group-item'>
          <Probe data={v} updateHook={this.props.fetchPhProbes} />
        </div>
      )
    })
    return list
  }

  render () {
    return (
      <ul className='list-group list-group-flush'>
        {this.probeList()}
        <li className='list-group-item'>
          <New hook={this.props.createProbe} />
        </li>
      </ul>
    )
  }
}

const mapStateToProps = state => {
  return {
    probes: state.phprobes
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchPhProbes: () => dispatch(fetchPhProbes()),
    createProbe: p => dispatch(createProbe(p))
  }
}

const Ph = connect(
  mapStateToProps,
  mapDispatchToProps
)(ph)
export default Ph
