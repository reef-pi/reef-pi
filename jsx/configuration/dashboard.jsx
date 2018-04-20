import React from 'react'
import $ from 'jquery'
import {ajaxGet, ajaxPost} from '../utils/ajax.js'
import { DropdownButton, MenuItem } from 'react-bootstrap'

export default class Dashboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      config: {updated: false},
      id_selectors: [],
      atos: [],
      tcs: [],
      id_uis: []
    }
    this.fetch = this.fetch.bind(this)
    this.save = this.save.bind(this)
    this.toRow = this.toRow.bind(this)
    this.grid = this.grid.bind(this)
    this.selectATO = this.selectATO.bind(this)
    this.selectTC = this.selectTC.bind(this)
    this.setID = this.setID.bind(this)
  }


  selectATO(i,j) {
    if(this.state.atos.length < 1) {
      return
    }
    var atos = []
    $.each(this.state.atos, function(k,v){
      atos.push(
        <MenuItem key={v.id} active={false} eventKey={v.name}>{v.name}</MenuItem>
      )
    }.bind(this))
    return(
    <DropdownButton title='none' id={'ato-select'} onSelect={this.setID(i,j)}>
      {atos}
    </DropdownButton>
    )
  }
  setID(i,j){
    return(function(k, ev){
      var config  = this.state.config
      config.grid_details[i][j].id = k
      this.setState({ config: config })
    }.bind(this))
  }

  selectTC(i,j) {
    if(this.state.tcs.length < 1) {
      return
    }
    var tcs = []
    $.each(this.state.tcs, function(k,v){
      tcs.push(
        <MenuItem key={v.id} active={false} eventKey={v.name}>{v.name}</MenuItem>
      )
    }.bind(this))
    return(
    <DropdownButton title={'none'} id={'tc-select'} onSelect={this.setID(i,j)}>
      {tcs}
    </DropdownButton>
    )
  }

  componentDidMount () {
    this.fetch()
  }

  setType (i,j) {
    return function(k,ev) {
      var config  = this.state.config
      var id_uis  = this.state.id_uis
      config.grid_details[i][j].type = k
      if( id_uis[i] === undefined){
        id_uis[i] = []
      }
      switch(k){
      case 'temperature':
      case 'tc':
        id_uis[i][j] = this.selectTC(i, j)
        break
      case 'ato':
        id_uis[i][j] = this.selectATO(i, j)
        break
      } 
      this.setState({
        config: config,
        id_uis: id_uis,
        updated: true
      })
    }.bind(this)
  }

  fetch () {
    ajaxGet({
      url: '/api/dashboard',
      success: function (data) {
        this.setState({
          config: data,
          updated: false
        })
      }.bind(this)
    })
    ajaxGet({
      url: '/api/atos',
      success: function (data) {
        this.setState({
          atos: data
        })
      }.bind(this)
    })
    ajaxGet({
      url: '/api/tcs',
      success: function (data) {
        this.setState({
          tcs: data
        })
      }.bind(this)
    })
  }

  save () {
    var payload = this.state.config
    payload.width = parseInt(payload.width)
    payload.height = parseInt(payload.height)
    payload.column = parseInt(payload.column)
    payload.row = parseInt(payload.row)
    payload.width = parseInt(payload.width)
    ajaxPost({
      url: '/api/dashboard',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetch()
      }.bind(this)
    })
  }

  toRow (key, label) {
    var fn = function (ev) {
      var config = this.state.config
      config[key] = ev.target.value
      this.setState({
        updated: true,
        config: config
      })
    }.bind(this)
    return (
      <div className='input-group'>
        <label className='input-group-addon'> {label}</label>
        <input type='text' onChange={fn} value={this.state.config[key]} id={'to-row-' + key} />
      </div>
    )
  }

  grid() {
   var config = this.state.config
   var id_uis = this.state.id_uis
   var row = parseInt(config.row)
   var column = parseInt(config.column)
   var i,j
   var rows = []
   var types = [
     <MenuItem key='light' active={true} eventKey='light'>light</MenuItem>,
     <MenuItem key='temperature' active={false} eventKey='temperature'>temperature</MenuItem>,
     <MenuItem key='health' active={false} eventKey='health'>health</MenuItem>,
     <MenuItem key='ato' active={false} eventKey='ato'>ato</MenuItem>,
     <MenuItem key='equipment' active={false} eventKey='equipment'>equipment</MenuItem>,
     <MenuItem key='tc' active={false} eventKey='tc'>tc</MenuItem>
   ]
   for(i = 0; i < row; i++ ) {
       if(config.grid_details[i] === undefined){
         config.grid_details[i] = []
       }
       if(id_uis[i] === undefined) {
         id_uis[i] = []
         }
     var columns = []
     for(j= 0; j<column; j++) {
       if(config.grid_details[i][j] === undefined){
         config.grid_details[i][j] = {type:'health'}
         this.setState({config: config, id_uis: id_uis})
       }
       if(id_uis[i][j] === undefined){
         id_uis[i][j] = <span>-</span>
       }
       columns.push(
         <div className='col-sm-3' key={'chart-type-'+i+'-'+j}>
           <div className='container'>
             <div className='col-sm-6'>
                <DropdownButton title={config.grid_details[i][j].type} id={'db-'+i+'-'+j} onSelect={this.setType(i,j)}>
                  {types}
                </DropdownButton>
                 {id_uis[i][j]}
             </div>
             <div className='col-sm-6'>
               {config.grid_details[i][j].id}
             </div>
           </div>
         </div>
       )
     }
     rows.push(
       <div className='row' key={'chart-details-'+i+'-'+'j'}>
         {columns}
       </div>
     )
   }
   var g = <div className='container'>
     <label> Charts </label>
     {rows}
   </div>
   return(g)
  }

  render() {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    return(
      <div className='container'>
        {this.toRow('row', 'Rows')}
        {this.toRow('column', 'Columns')}
        {this.toRow('width', 'Width')}
        {this.toRow('height', 'Height')}
        {this.grid()}
        <div className='row'>
          <input type='button' className={updateButtonClass} onClick={this.save} id='save_dashboard' value='update' />
        </div>
      </div>
    )
  }
}
