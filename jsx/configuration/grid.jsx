import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import ComponentSelector from './component_selector.jsx'


// props: rows, columns, hook, cells, tcs, atos
export default class Grid extends React.Component {
  constructor (props) {
    super(props)
    var i,j
    var cells = []
    for(i = 0; i < props.rows; i++ ) {
      var columns = []
      cells[i] = []
      for(j= 0; j< props.columns; j++) {
        if(props.cells[i]=== undefined || props.cells[i][j] === undefined){
          cells[i][j]  = {type: 'health'}
          continue
        }
        cells[i][j] = {
          type: props.cells[i][j].type,
          id: props.cells[i][j].id
        }
      }
    }
    this.state = {
      cells: cells
    }
    this.setType = this.setType.bind(this)
    this.updateHook = this.updateHook.bind(this)
    this.initiatlizeCell = this.initiatlizeCell.bind(this)
    this.cellUI = this.cellUI.bind(this)
    this.menuItem = this.menuItem.bind(this)
    this.menuItems = this.menuItems.bind(this)
  }

  cellUI(type, current_id, i,j) {
    var data
    switch(type){
      case 'ato':
        data = this.props.atos
        break;
      case 'equipment':
        return(<span>-</span>)
        break;
      case 'health':
        data = [{id: 'current', name: 'current'},{id: 'historical', name:'historical'}]
        break;
      case 'light':
        data = this.props.lights
        break;
      case 'ph-current':
      case 'ph-historical':
        data = this.props.phs
        break;
      case 'temperature':
      case 'tc':
        data = this.props.tcs
        break;
    }

    return(
      <ComponentSelector
         components={data}
         hook={this.updateHook(i, j)}
         selector_id={'component-'+type+'-'+i+'-'+j}
         current_id={current_id}
       />
    )
  }

  initiatlizeCell(i,j) {
    var cells = this.state.cells
    if(cells === undefined){
      cells = []
    }
    if(cells[i] === undefined){
      cells[i] = []
    }
    for(j= 0; j<this.props.columns; j++) {
      if(cells[i][j] === undefined){
        cells[i][j] = {
          type:'health'
        }
      }
      cells[i][j].ui = this.cellUI(cells[i][j].type, cells[i][j].id, i, j)
    }
    return(cells)
  }

  updateHook(i,j) {
    return(function(id){
      var cells = this.state.cells
      cells[i][j].id = id
      this.setState({cells: cells})
      this.props.hook(cells)
    }.bind(this))
  }

  setType (i,j) {
    return( function(k,ev) {
     var cells = this.initiatlizeCell(i,j)
     cells[i][j].type = k
     cells[i][j].ui = this.cellUI(k, '', i, j)
     this.setState({cells: cells})
     this.props.hook(cells)
    }.bind(this))
  }


  menuItem(type, a, i,j) {
    return(
     <MenuItem key={type} active={a} eventKey={type}>
       <span id={type+'-chart-'+i+'-'+j}>{type}</span>
     </MenuItem>
   )
  }

  menuItems(i, j) {
   var types = [
     this.menuItem('ato', false, i, j),
     this.menuItem('equipment', false, i, j),
     this.menuItem('health', false, i, j),
     this.menuItem('light', false, i, j),
     this.menuItem('ph-current', false, i, j),
     this.menuItem('ph-historical', false, i, j),
     this.menuItem('tc', false, i, j),
     this.menuItem('temperature', false, i, j),
   ]
   return(types)
  }

  render(){
   var rows = []
   var i,j
   var cells = this.state.cells
   if(cells === undefined){
     cells = []
   }
   for(i = 0; i < this.props.rows; i++ ) {
     var columns = []
     for(j= 0; j<this.props.columns; j++) {
       cells = this.initiatlizeCell(i, j)
       columns.push(
         <div className='col-sm-3' key={'chart-type-'+i+'-'+j} style={{border: '1px solid black'}}>
           <div className='row'>
              <DropdownButton title={cells[i][j].type} id={'db-'+i+'-'+j} onSelect={this.setType(i,j)}>
                {this.menuItems(i,j)}
              </DropdownButton>
           </div>
           <div className='row'>
             {cells[i][j].ui}
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

   return(
     <div className='container'>
       <label> Charts </label>
       {rows}
     </div>
   )
  }
}
