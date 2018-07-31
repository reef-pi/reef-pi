import React from 'react'
import {fetchMacros, updateMacro, deleteMacro} from 'redux/actions/macro'
import {connect} from 'react-redux'
import $ from 'jquery'
import New from './new'
import Macro from './macro'

class main extends React.Component {
  componentDidMount () {
    this.props.fetch()
  }

  render () {
    var list = []
    $.each(this.props.macros, function (k, v) {
      list.push(
        <div key={k} className='row list-group-item'>
          <Macro
            name={v.name}
            steps={v.steps}
            delete={() => { this.props.delete(v.id) }}
            update={(m) => { this.props.update(v.id, m) }}
            macro_id={v.id}
          />
        </div>
      )
    }.bind(this))

    return (
      <div className='container'>
        <ul className='list-group list-group-flush'>
          {list}
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
