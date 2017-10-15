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
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })
  }

  update (e) {
    this.ajaxPost({
      url: '/api/equipments/' + this.props.id,
      data: JSON.stringify({
        on: this.state.action === 'on',
        name: this.props.name,
        outlet: this.props.outlet
      }),
      success: function (data) {
        this.setState({
          action: this.state.action === 'on' ? 'off' : 'on'
        })
      }.bind(this),
      error: function (xhr, status, err) {
        this.setState({
          showAlert: true,
          alertMsg: xhr.responseText
        })
      }.bind(this)
    })
  }

  componentDidMount () {
    this.fetchOutlet()
  }

  render () {
    var btnClass = 'btn btn-outline-success'
    if (this.state.action === 'off') {
      btnClass = 'btn btn-outline-danger'
    }

    return (
      <div className='container'>
        {super.render()}
        <div className='col-sm-8'>
          <div className='col-sm-8'>
            <label>{this.props.name}</label>
          </div>
          <div className='col-sm-4'>
            <label className='small'> {this.state.outlet.name} </label>
          </div>
        </div>
        <div className='col-sm-4 pull-right'>
          <input id={this.props.name} type='button' value={this.state.action} onClick={this.update} className={btnClass} />
        </div>
      </div>
    )
  }
}
