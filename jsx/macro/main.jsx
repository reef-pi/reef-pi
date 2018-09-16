import React from 'react'
import { runMacro, fetchMacros, updateMacro, deleteMacro } from 'redux/actions/macro'
import { connect } from 'react-redux'
import New from './new'
import Macro from './macro'

class main extends React.Component {
  componentDidMount () {
    this.props.fetch()
    var timer = window.setInterval(this.props.fetch, 10 * 1000)
    this.setState({ timer: timer })
  }

  componentWillUnmount () {
    if (this.state && this.state.timer) {
      window.clearInterval(this.state.timer)
    }
  }

  render () {
    var list = []
    this.props.macros.forEach((v, k) => {
      list.push(
        <div key={k} className='row list-group-item'>
          <Macro
            name={v.name}
            steps={v.steps}
            delete={() => {
              this.props.delete(v.id)
            }}
            update={m => {
              this.props.update(v.id, m)
            }}
            macro_id={v.id}
            run={() => {
              this.props.run(v.id)
              this.props.fetch()
            }}
            enable={v.enable}
          />
        </div>
      )
    })

    return [<ul className='list-group list-group-flush'>{list}</ul>, <New />]
  }
}

const mapStateToProps = state => {
  return {
    macros: state.macros
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchMacros()),
    update: (id, m) => dispatch(updateMacro(id, m)),
    delete: id => dispatch(deleteMacro(id)),
    run: id => dispatch(runMacro(id))
  }
}

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(main)
export default Main
