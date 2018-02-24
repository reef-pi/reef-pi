import $ from 'jquery'
import React from 'react'
import {ajaxDelete, ajaxPost} from '../utils/ajax.js'
import {confirm} from '../utils/confirm.js'
import Chart from './chart.jsx'

export default class Probe extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
     name: props.data.name,
     period: props.data.period,
     enable: props.data.enable,
     address: props.data.address,
     readOnly: true
    }

    this.remove = this.remove.bind(this)
    this.update = this.update.bind(this)
    this.updateEnable = this.updateEnable.bind(this)
    this.edit = this.edit.bind(this)
    this.chart = this.chart.bind(this)
  }

  chart() {
    if(!this.state.enable) {
      return(<div />)
    }
    return(<Chart id={this.props.data.id} width={500} height={300}/>)
  }

  edit() {
    if(this.state.readOnly) {
      this.setState({readOnly: false})
      return
    }

    var payload = {
      name: this.state.name,
      period: parseInt(this.state.period),
      enable: this.state.enable,
      address: parseInt(this.state.address)
    }

    ajaxPost({
      url: '/api/phprobes/'+this.props.data.id,
      data: JSON.stringify(payload),
      success: function (data) {
        this.setState({readOnly: true})
      }.bind(this)
    })
  }

  updateEnable(ev) {
    this.setState({enable: ev.target.checked})
  }

  remove() {
    confirm('Are you sure ?')
    .then(function () {
      ajaxDelete({
        url: '/api/phprobes/' + this.props.data.id,
        type: 'DELETE',
        success: function (data) {
          if(this.props.upateHook !== undefined) {
            this.props.upateHook()
          }
        }.bind(this)
      })
    }.bind(this))
  }

  update(k) {
    return(function(ev){
      var h = {}
      h[k] = ev.target.value
      this.setState(h)
    }.bind(this))
  }

  render(){
    var editText = 'edit'
    var editClass = 'btn btn-outline-success'
    var name = <label>{this.state.name}</label>
    if(!this.state.readOnly) {
       editText = 'save'
       editClass = 'btn btn-outline-primary'
       name = <input type='text' value={this.state.name} onChange={this.update('name')} className='col-sm-2' readOnly={this.state.readOnly}/>
    }
    return(
      <div className='conainer'>
        <div className='row'>
          {name}
        </div>
        <div className='row'>
          <label className='col-sm-3'>Enable</label>
          <input type='checkbox' value={this.state.enable} onChange={this.updateEnable} className='col-sm-2' defaultChecked={this.props.data.enable} disabled={this.state.readOnly}/>
        </div>
        <div className='row'>
          <label className='col-sm-3'> Interval </label>
          <input type='text' value={this.state.period} onChange={this.update('period')} className='col-sm-2' readOnly={this.state.readOnly}/>
        </div>
        <div className='row'>
          {this.chart()}
        </div>
        <div className='row'>
          <div className='col-sm-8'/>
          <div className='col-sm-1'>
            <input type='button' id={'edit-probe-' + this.props.data.id} onClick={this.edit} value={editText} className={editClass} />
          </div>
            <div className='col-sm-1'>
          <input type='button' id={'remove-probe-' + this.props.data.id} onClick={this.remove} value='delete' className='btn btn-outline-danger' />
          </div>
        </div>
      </div>
    )
  }
}
