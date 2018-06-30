import React from 'react'
import $ from 'jquery'
import {fetchInlets} from '../redux/actions/inlets'
import {connect} from 'react-redux'

class inletSelector extends React.Component {
  constructor (props) {
    super(props)
    var inlet
    $.each(props.inlets, function (k, v) {
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

  componentDidMount () {
    this.props.fetchInlets()
  }

  inlets () {
    var readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    var title = ''
    var id = ''
    if (this.state.inlet !== undefined) {
      title = this.state.inlet.name
      id = this.state.inlet.id
    }
    var items = []
    $.each(this.props.inlets, function (k, v) {
      var cName = 'dropdown-item'
      if (v.id === id) {
        cName += ' active'
      }
      items.push(
        <a className={cName} href='#' onClick={this.set(k)} key={k}>
          <span id={this.props.name + '-' + v.id}>{v.name}</span>
        </a>
      )
    }.bind(this))
    return (
      <div className='dropdown'>
        <button className='btn btn-secondary dropdown-toggle' type='button' id={this.props.name + '-inlet'} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' disabled={readOnly}>
          {title}
        </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          {items}
        </div>
      </div>
    )
  }

  set (k) {
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

  render () {
    return (
      <div className='container'>
        Inlet
        {this.inlets()}
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return { inlets: state.inlets }
}

const mapDispatchToProps = (dispatch) => {
  return {fetchInlets: () => dispatch(fetchInlets())}
}

const InletSelector = connect(mapStateToProps, mapDispatchToProps)(inletSelector)
export default InletSelector
