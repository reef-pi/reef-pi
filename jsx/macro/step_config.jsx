import React from 'react'
import $ from 'jquery'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

class stepConfig extends React.Component {
  constructor (props) {
    super(props)
    this.set = this.set.bind(this)
  }

  set (k) {
    return () => {
      this.props.hook({
        id: k,
        on: true
      })
    }
  }

  render () {
    var readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    var name = ''
    var items = []
    var elements = this.props[this.props.type]
    if (!elements) {
      elements = []
    }
    $.each(elements, function (k, v) {
      var cName = 'dropdown-item'
      if (this.props.active === v.id) {
        cName += ' active'
        name = v.name
      }
      items.push(
        <a className={cName} href='#' key={k} onClick={this.set(v.id)}>
          <span id={this.props.type + '-' + v.id}>{v.name}</span>
        </a>)
    }.bind(this))

    return (
      <div className='dropdown'>
        <button
          className='btn btn-secondary dropdown-toggle'
          type='button'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
          disabled={readOnly} >
          {name}
        </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          {items}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    equipment: state.equipments,
    timer: state.timers,
    ato: state.atos,
    tc: state.tcs,
    ph: state.phprobes,
    doser: state.dosers,
    macro: state.macros,
    subsystem: [
      { id: 'timer', name: 'timer' },
      { id: 'ph', name: 'pH' },
      { id: 'ato', name: 'ATO' },
      { id: 'tc', name: 'temperature' },
      { id: 'lighting', name: 'lighting' },
      { id: 'system', name: 'system' },
      { id: 'doser', name: 'doser' }
    ]
  }
}
const StepConfig = connect(mapStateToProps, null)(stepConfig)
export default StepConfig

stepConfig.propTypes = {
  type: PropTypes.string,
  active: PropTypes.string,
  hook: PropTypes.func,
  readOnly: PropTypes.bool
}
