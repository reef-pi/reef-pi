import React from 'react'
import {showAlert} from 'utils/alert'
import {createATO} from 'redux/actions/ato'
import InletSelector from 'connectors/inlet_selector'
import {connect} from 'react-redux'

class newATO extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      enable: false,
      inlet: '',
      period: 60,
      add: false
    }
    this.add = this.add.bind(this)
    this.toggle = this.toggle.bind(this)
    this.ui = this.ui.bind(this)
    this.update = this.update.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.setInlet = this.setInlet.bind(this)
  }

  setInlet (id) {
    this.setState({inlet: id})
  }

  updateEnable (ev) {
    this.setState({enable: ev.target.checked})
  }

  update (k) {
    return (function (ev) {
      var h = {}
      h[k] = ev.target.value
      this.setState(h)
    }.bind(this))
  }

  toggle () {
    this.setState({
      add: !this.state.add
    })
    this.setState({
      name: '',
      enable: false,
      period: 60,
      inlet: ''
    })
  }

  ui () {
    if (!this.state.add) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>Name</div>
          <div className='col'>
            <input type='text' id='new_ato_sensor_name' onChange={this.update('name')} value={this.state.name} />
          </div>
        </div>
        <div className='row'>
          <div className='col'>Enable</div>
          <div className='col'>
            <input type='checkbox' id='new_ato_sensor_enable' onChange={this.updateEnable} value={this.state.enable} />
          </div>
        </div>
        <div className='row'>
          <InletSelector update={this.setInlet} name='new_ato' />
        </div>
        <div className='row'>
          <div className='col'>Period</div>
          <div className='col'><input type='text' onChange={this.update('period')} value={this.state.period} id='new_ato_sensor_period' /></div>
        </div>
        <div className='row'>
          <div className='col'>
            <div className='float-right'>
              <input type='button' id='create_ato' value='add' onClick={this.add} className='btn btn-outline-primary' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  add () {
    if (this.state.name === '') {
      showAlert('Name can not be empty')
      return
    }
    var payload = {
      name: this.state.name,
      enable: this.state.enable,
      inlet: this.state.inlet,
      period: parseInt(this.state.period)
    }
    this.props.createATO(payload)
    this.toggle()
  }

  render () {
    return (
      <div className='container'>
        <input id='add_new_ato_sensor' type='button' value={this.state.add ? '-' : '+'} onClick={this.toggle} className='btn btn-outline-success' />
        {this.ui()}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createATO: (a) => dispatch(createATO(a))
  }
}

const New = connect(null, mapDispatchToProps)(newATO)
export default New
