import React from 'react'
import SelectEquipment from '../select_equipment.jsx'
import InletSelector from '../connectors/inlet_selector.jsx'
import ATOChart from './chart.jsx'
import {ajaxDelete, ajaxPost} from '../utils/ajax.js'
import {confirm} from '../utils/confirm.js'

export default class ATO extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ato: this.props.data,
      readOnly: true
    }
    this.save = this.save.bind(this)
    this.remove = this.remove.bind(this)
    this.showControl = this.showControl.bind(this)
    this.updateCheckBox = this.updateCheckBox.bind(this)
    this.update = this.update.bind(this)
    this.updatePump = this.updatePump.bind(this)
    this.setInlet = this.setInlet.bind(this)
  }
  setInlet(id) {
   var ato = this.state.ato
   ato.inlet = id
    this.setState({ato: ato})
  }

  updatePump(id) {
   var ato = this.state.ato
   ato.pump = id
   this.setState({ato: ato})
  }

  remove() {
    confirm('Are you sure ?')
    .then(function () {
      ajaxDelete({
        url: '/api/atos/' + this.props.data.id,
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
      var h = this.state.ato
      h[k] = ev.target.value
      this.setState({
        ato:h,
      })
    }.bind(this))
  }

  updateCheckBox (key) {
    return (function (ev) {
      var ato = this.state.ato
      ato[key] = ev.target.checked
      this.setState({
        ato: ato,
        updated: true
      })
    }.bind(this))
  }

  save () {
    if(this.state.readOnly) {
      this.setState({readOnly: false})
      return
    }

    var ato = this.state.ato
    ato.period = parseInt(ato.period)
    if (isNaN(ato.period)) {
      this.setState({
        showAlert: true,
        alertMsg: 'Check frequency has to be a positive integer',
      })
      return
    }

    ajaxPost({
      url: '/api/atos/'+this.props.data.id,
      type: 'POST',
      data: JSON.stringify(ato),
      success: function (data) {
        this.setState({
          updated: false,
          readOnly: true,
          ato: ato
        })
      }.bind(this)
    })
  }

  showControl () {
    if (!this.state.ato.control) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>Pump</div>
          <div className='col-sm-4'>
            <SelectEquipment
               update={this.updatePump}
               active={this.state.ato.pump}
               id='ato-pump'
               readOnly={this.state.readOnly}
            />
          </div>
        </div>
      </div>
    )
  }

  render () {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    var editText = 'edit'
    var editClass = 'btn btn-outline-success'
    var name = <label>{this.state.ato.name}</label>
    if(!this.state.readOnly) {
       editText = 'save'
       editClass = 'btn btn-outline-primary'
       name = <input type='text' value={this.state.ato.name} onChange={this.update('name')} className='col-sm-2' readOnly={this.state.readOnly}/>
    }
    return (
      <div className='container'>
        <div className='row'>
          {name}
        </div>
        <div className='row'>
          <InletSelector update={this.setInlet} readOnly={this.state.readOnly} active={this.state.ato.inlet} />
        </div>
        <div className='row'>
          <div className='col-sm-2'>Enable</div>
          <input type='checkbox' id='ato_enable' className='col-sm-2' defaultChecked={this.state.ato.enable} onClick={this.updateCheckBox('enable')} disabled={this.state.readOnly}/>
        </div>
      <div className='container'>
        <div className='row'>
          <div className='col-sm-3'>Check frequency</div>
          <input type='text' onChange={this.update('period')} id='period' className='col-sm-1' value={this.state.ato.period} readOnly={this.state.readOnly}/>
          <span>second(s)</span>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Control</div>
          <input type='checkbox' id='ato_control' className='col-sm-2' defaultChecked={this.state.ato.control} onClick={this.updateCheckBox('control')} disabled={this.state.readOnly}/>
        </div>
        {this.showControl()}
      </div>
      <div className='row'>
        <div className='col-sm-1'>
          <input type='button' id='updateATO' onClick={this.save} value={editText} className={editClass} />
        </div>
        <div className='col-sm-1'>
          <input type='button' id={'remove-ato-' + this.props.data.id} onClick={this.remove} value='delete' className='btn btn-outline-danger' />
        </div>
      </div>
       <div className='row'>
         <ATOChart ato_id={this.props.data.id} width={500} height={300}/>
       </div>
     </div>
    )
  }
}
