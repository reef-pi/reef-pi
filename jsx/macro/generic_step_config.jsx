import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

class stepConfig extends React.Component {
  constructor(props) {
    super(props)
    this.set = this.set.bind(this)
    this.updateOn = this.updateOn.bind(this)
  }

  updateOn(on) {
    return () => {
      this.props.hook({
        id: this.props.active,
        on: on
      })
    }
  }

  set(k) {
    return () => {
      this.props.hook({
        id: k,
        on: true
      })
    }
  }

  render() {
    var readOnly = this.props.readOnly !== undefined ? this.props.readOnly : false
    var name = ''
    var items = []
    var elements = this.props[this.props.type]
    elements.forEach((v, k) => {
      var cName = 'dropdown-item'
      if (this.props.active === v.id) {
        cName += ' active'
        name = v.name
      }
      items.push(
        <a className={cName} href="#" key={k} onClick={this.set(v.id)}>
          <span id={this.props.type + '-' + v.id}>{v.name}</span>
        </a>
      )
    })

    return (
      <div className="row">
        <div className="col">
          <div className="dropdown">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              data-toggle="dropdown"
              id={this.props.macro_id + '-' + this.props.index + '-step-state'}
              disabled={readOnly}
            >
              {name}
            </button>
            <div className="dropdown-menu">{items}</div>
          </div>
        </div>
        <div className="col">
          <div className="row">
            <div className="input-group col">
              <div className="input-group-text">
                <input
                  type="radio"
                  name={this.props.macro_id + '-' + this.props.index + '-step-state'}
                  id={this.props.macro_id + '-' + this.props.index + '-step-on'}
                  defaultChecked={this.props.on}
                  disabled={this.props.readOnly}
                  onClick={this.updateOn(true)}
                />
              </div>
              <label>On</label>
            </div>
            <div className="input-group col">
              <div className="input-group-text">
                <input
                  type="radio"
                  name={this.props.macro_id + '-' + this.props.index + '-step-state'}
                  id={this.props.macro_id + '-' + this.props.index + '-step-off'}
                  defaultChecked={!this.props.on}
                  disabled={this.props.readOnly}
                  onClick={this.updateOn(false)}
                />
              </div>
              <label>Off</label>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

stepConfig.propTypes = {
  type: PropTypes.string,
  active: PropTypes.string,
  hook: PropTypes.func,
  readOnly: PropTypes.bool,
  macro_id: PropTypes.string,
  index: PropTypes.number,
  on: PropTypes.bool
}

const mapStateToProps = state => {
  return {
    equipment: state.equipment,
    timers: state.timers,
    ato: state.atos,
    temperature: state.tcs,
    phprobes: state.phprobes,
    doser: state.dosers,
    macro: state.macros,
    subsystem: [
      { id: 'timers', name: 'timer' },
      { id: 'phprobes', name: 'pH' },
      { id: 'ato', name: 'ATO' },
      { id: 'temperature', name: 'temperature' },
      { id: 'lightings', name: 'lighting' },
      { id: 'system', name: 'system' },
      { id: 'doser', name: 'doser' }
    ]
  }
}
const GenericStepConfig = connect(
  mapStateToProps,
  null
)(stepConfig)
export default GenericStepConfig
