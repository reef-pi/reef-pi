import React from 'react'
import {hideAlert} from '../utils/alert.js'

export default class Equipment extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      action: (props.on ? 'off' : 'on'),
      value: this.props.value
    }
    this.update = this.update.bind(this)
  }

  update (e) {
    var payload = {
      on: this.state.action === 'on',
      name: this.props.name,
      outlet: this.props.outlet.id
    }
    this.props.hook(this.props.id, payload)
    this.setState({
      action: this.state.action === 'on' ? 'off' : 'on'
    })
  }

  render () {
    var onBtnClass = 'btn btn-secondary btn-block'
    if (this.state.action === 'off') {
      onBtnClass = 'btn btn-success btn-block'
    }
    return (
      <div className='container'>
        <div className='col-sm-8'>
          <div className='col-sm-8'>
            <input id={this.props.name + '-on'} type='button' value={this.props.name} onClick={this.update} className={onBtnClass} />
          </div>
          <div className='col-sm-4'>
            <label className='small'> {this.props.outlet.name} </label>
          </div>
        </div>
      </div>
    )
  }
}
