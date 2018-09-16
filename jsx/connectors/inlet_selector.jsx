import React from 'react'
import $, { isEmptyObject } from 'jquery'
import { fetchInlets } from '../redux/actions/inlets'
import { connect } from 'react-redux'

class inletSelector extends React.Component {
  constructor(props) {
    super(props)
    var inlet
    props.inlets.forEach((v, k) => {
      if (v.id === props.active) {
        inlet = v
      }
    })
    this.state = {
      inlet: inlet
    }
    this.inlets = this.inlets.bind(this)
    this.set = this.set.bind(this)
  }

  componentDidMount() {
    this.props.fetchInlets()
  }

  static getDerivedStateFromProps(props, state) {
    if (props.inlets === undefined) {
      return null
    }
    if (isEmptyObject(props.inlets)) {
      return null
    }
    props.inlets.forEach((v, k) => {
      if (v.id === props.active) {
        state.inlet = v
      }
    })
    return state
  }

  inlets() {
    var readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    var title = ''
    var id = this.props.active
    if (this.state.inlet !== undefined) {
      title = this.state.inlet.name
      id = this.state.inlet.id
    }
    var items = []
    this.props.inlets.forEach((v, k) => {
      var cName = 'dropdown-item'
      if (v.id === id) {
        cName += ' active'
      }
      items.push(
        <a className={cName} href="#" onClick={this.set(k)} key={k}>
          <span id={this.props.name + '-' + v.id}>{v.name}</span>
        </a>
      )
    })
    return (
      <div className="dropdown">
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          id={this.props.name + '-inlet'}
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          disabled={readOnly}
        >
          {title}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {items}
        </div>
      </div>
    )
  }

  set(k) {
    return () => {
      var i = this.props.inlets[k]
      if (i === undefined) {
        return
      }
      this.setState({
        inlet: i
      })
      this.props.update(i.id)
    }
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-1">Inlet</div>
          <div className="col-lg-1">{this.inlets()}</div>
        </div>
      </div>
    )
  }
}
const mapStateToProps = state => {
  return { inlets: state.inlets }
}

const mapDispatchToProps = dispatch => {
  return { fetchInlets: () => dispatch(fetchInlets()) }
}

const InletSelector = connect(
  mapStateToProps,
  mapDispatchToProps
)(inletSelector)
export default InletSelector
