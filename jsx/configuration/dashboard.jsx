import React from 'react'
import $ from 'jquery'
import {ajaxGet, ajaxPost} from '../utils/ajax.js'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import Grid from './grid.jsx'

export default class Dashboard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      updated: false,
      config: {},
      atos: [],
      tcs: [],
      lights: [],
      phs: [],
    }
    this.fetch = this.fetch.bind(this)
    this.save = this.save.bind(this)
    this.toRow = this.toRow.bind(this)
    this.updateHook = this.updateHook.bind(this)
  }


  componentDidMount () {
    this.fetch()
  }

  fetch () {
    ajaxGet({
      url: '/api/dashboard',
      success: function (data) {
        this.setState({
          config: data,
          rows: data.row,
          columns: data.column,
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
      url: '/api/phprobes',
      success: function (data) {
        this.setState({
          phs: data
        })
      }.bind(this)
    })
    ajaxGet({
      url: '/api/lights',
      success: function (data) {
        this.setState({
          lights: data
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

  updateHook(cells){
    var config = this.state.config
    var i, j
    for(i = 0; i< config.row; i ++ ) {
      if(config.grid_details[i]=== undefined) {
        config.grid_details[i] = []
      }
      for(j =0 ;j< config.column; j++) {
        config.grid_details[i][j] = {
          id: cells[i][j].id,
          type: cells[i][j].type
        }
      }
    }
    this.setState({
		  config: config,
      updated: true
    })
  }

  render() {
    var updateButtonClass = 'btn btn-outline-success col-sm-2'
    if (this.state.updated) {
      updateButtonClass = 'btn btn-outline-danger col-sm-2'
    }
    if(this.state.config.grid_details === undefined) {
      return(<div />)
    }
    return(
      <div className='container'>
        {this.toRow('row', 'Rows')}
        {this.toRow('column', 'Columns')}
        {this.toRow('width', 'Width')}
        {this.toRow('height', 'Height')}
        <div className='row'>
          <Grid
            rows={this.state.config.row}
            cells={this.state.config.grid_details}
            columns={this.state.config.column}
            hook={this.updateHook}
            tcs={this.state.tcs}
            atos={this.state.atos}
            phs={this.state.phs}
            lights={this.state.lights}
          />
        </div>
        <div className='row'>
          <input type='button' className={updateButtonClass} onClick={this.save} id='save_dashboard' value='update' />
        </div>
      </div>
    )
  }
}
