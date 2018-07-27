import React from 'react'
import {fetchMacros, updateMacro, deleteMacro} from 'redux/actions/macro'
import {connect} from 'react-redux'
import $ from 'jquery'
import New from './new'
import Macro from './macro'

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
      var steps = v.steps
      if (!steps) {
        steps = []
      }
      list.push(
        <div key={k} className='row list-group-item'>
          <Macro
            name={v.name}
            steps={steps}
            delete={() => { this.props.delete(v.id) }}
            update={(m) => { this.props.update(v.id, m) }}
          />
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
    fetch: () => dispatch(fetchMacros()),
    update: (id, m) => dispatch(updateMacro(id, m)),
    delete: (id) => dispatch(deleteMacro(id))
  }
}

const Main = connect(mapStateToProps, mapDispatchToProps)(main)
export default Main
