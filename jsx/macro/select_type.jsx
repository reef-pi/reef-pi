import React from 'react'
import $ from 'jquery'
import PropTypes from 'prop-types'

export default class SelectType extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      type: props.type
    }
    this.list = this.list.bind(this)
    this.set = this.set.bind(this)
  }

  list () {
    var validTypes = [
      'wait',
      'equipments',
      'ato',
      'temperature',
      'doser',
      'timers',
      'phprobes',
      'subsystem',
      'macro'
    ]
    var items = []
    $.each(validTypes, function (k, v) {
      var cName = 'dropdown-item'
      if (this.state.type === v) {
        cName += ' active'
      }
      items.push(
        <a className={cName} href='#' key={k} onClick={this.set(v)}>
          <span id={v + '-' + this.props.macro_id + '-' + this.props.index}>{v}</span>
        </a>)
    }.bind(this))
    return items
  }

  set (k) {
    return () => {
      this.setState({
        type: k
      })
      this.props.hook(k)
    }
  }

  render () {
    var readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    return (
      <div className='dropdown'>
        <button
          className='btn btn-secondary dropdown-toggle'
          type='button'
          data-toggle='dropdown'
          disabled={readOnly}
          id={'select-type-' + this.props.macro_id + '-' + this.props.index}
        >
          {this.state.type}
        </button>
        <div className='dropdown-menu'>
          {this.list()}
        </div>
      </div>
    )
  }
}

SelectType.propTypes = {
  hook: PropTypes.func,
  readOnly: PropTypes.bool,
  macro_id: PropTypes.string,
  type: PropTypes.string,
  index: PropTypes.number
}
