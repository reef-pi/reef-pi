import React from 'react'
import {fetchMacros} from 'redux/actions/macro'
import {connect} from 'react-redux'
import $ from 'jquery'
import New from './new'

class main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.list = this.list.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  list () {
    var list = []
    var index = 0
    $.each(this.props.macros, function (k, v) {
      list.push(
        <div key={k} className='row list-group-item'>
          <span>Macro - {k}</span>
        </div>
      )
      index = index + 1
    })
    return list
  }

  render () {
    return (
      <div className='container'>
        <ul className='list-group list-group-flush'>
          {this.list()}
        </ul>
        <New />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    macros: state.macros
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: () => dispatch(fetchMacros())
  }
}

const Main = connect(mapStateToProps, mapDispatchToProps)(main)
export default Main
