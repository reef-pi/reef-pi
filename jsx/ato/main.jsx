import React from 'react'
import $ from 'jquery'
import ATO from './ato.jsx'
import New from './new.jsx'
import {fetchATOs} from '../redux/actions/ato'
import {connect} from 'react-redux'
import {isEmptyObject} from 'jquery'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.list = this.list.bind(this)
  }

  componentDidMount () {
    this.props.fetchATOs()
  }

  list () {
    var list = []
    var index = 0
    $.each(this.props.atos, function (k, v) {
      list.push(
        <div key={k} className='row list-group-item'>
          <ATO data={v} upateHook={this.props.fetchATOs} />
        </div>
      )
      index = index + 1
    }.bind(this))
    return list
  }

  render () {
    return (
      <div className='container'>
        <ul className='list-group'>
          {this.list()}
        </ul>
        <New updateHook={this.props.fetchATOs} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    atos: state.atos
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchATOs: () => dispatch(fetchATOs()),
  }
}

const Main = connect(mapStateToProps, mapDispatchToProps)(main)
export default Main
