import React from 'react'
import Common from './common.jsx'

export default class Equipment extends Common {
  constructor (props) {
    super(props)
    this.state = {
      outlet: {},
      action: (props.on ? 'off' : 'on'),
      value: this.props.value
    }
    this.update = this.update.bind(this)
    this.fetchOutlet = this.fetchOutlet.bind(this)
  }

  fetchOutlet () {
    this.ajaxGet({
      url: '/api/outlets/' + this.props.outlet,
      success: function (data) {
        this.setState({
          outlet: data
        })
      }.bind(this)
    })
  }

  update (e) {
    this.ajaxPost({
      url: '/api/equipment/' + this.props.id,
      data: JSON.stringify({
        on: this.state.action === 'on',
        name: this.props.name,
        outlet: this.props.outlet
      }),
      success: function (data) {
        this.setState({
          action: this.state.action === 'on' ? 'off' : 'on'
        })
      }.bind(this)
    })
  }

  componentDidMount () {
    this.fetchOutlet()
  }

  render () {
    var onBtnClass = 'btn btn-secondary btn-block'
    if (this.state.action === 'off') {
      onBtnClass = 'btn btn-success btn-block'
    }

    return (
      <div className='container'>
        {super.render()}
        <div className='col-sm-8'>
          <div className='col-sm-8'>
            <input id={this.props.name + '-on'} type='button' value={this.props.name} onClick={this.update} className={onBtnClass} />
          </div>
          <div className='col-sm-4'>
            <label className='small'> {this.state.outlet.name} </label>
          </div>
        </div>
      </div>
    )
  }
}
