import React from 'react'
import $ from 'jquery'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import ComponentSelector from './component_selector.jsx'


// props: rows, columns, hook, cells, tcs, atos
export default class Grid extends React.Component {
  constructor (props) {
    super(props)
    var i,j
    var cells = props.cells
    for(i = 0; i < props.rows; i++ ) {
      var columns = []
      for(j= 0; j< props.columns; j++) {
        if(cells[i]=== undefined){
          cells[i]  = []
        }
        if(cells[i][j] === undefined){
          cells[i][j] = {
            type:'health',
            ui: <span>-</span>
          }
        }
      }
    }
    this.state = {
      cells: cells
    }
    this.setType = this.setType.bind(this)
    this.updateHook = this.updateHook.bind(this)
    this.initiatlizeCell = this.initiatlizeCell.bind(this)
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
          type:'health',
          ui: <span>-</span>
        }
      }
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
      var el
      switch(k){
      case 'health':
        el = <span>-</span>
        break;
      case 'light':
        el = <ComponentSelector
              components={this.props.lights}
              hook={this.updateHook(i, j)}
              selector_id='-'
              />
        break;
      case 'ph':
        el = <ComponentSelector
              components={this.props.phs}
              hook={this.updateHook(i, j)}
              selector_id='-'
              />
        break;
      case 'temperature':
      case 'tc':
        console.log("Setting temp selector")
        el = <ComponentSelector
             components={this.props.tcs}
             hook={this.updateHook(i, j)}
             selector_id='-'
             />
        break;
      case 'ato':
        el = <ComponentSelector
              components={this.props.atos}
              hook={this.updateHook(i, j)}
              selector_id='-'
              />
        break;
      }
     var cells = this.initiatlizeCell(i,j)
     cells[i][j].ui = el
     cells[i][j].type = k
     this.setState({cells: cells})
    }.bind(this))
  }



  render(){
   var types = [
     <MenuItem key='light' active={true} eventKey='light'>light</MenuItem>,
     <MenuItem key='temperature' active={false} eventKey='temperature'>temperature</MenuItem>,
     <MenuItem key='health' active={false} eventKey='health'>health</MenuItem>,
     <MenuItem key='ato' active={false} eventKey='ato'>ato</MenuItem>,
     <MenuItem key='equipment' active={false} eventKey='equipment'>equipment</MenuItem>,
     <MenuItem key='tc' active={false} eventKey='tc'>TC</MenuItem>,
     <MenuItem key='ph' active={false} eventKey='ph'>pH</MenuItem>
   ]
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
         <div className='col-sm-3' key={'chart-type-'+i+'-'+j}>
           <div className='row'>
              <DropdownButton title={cells[i][j].type} id={'db-'+i+'-'+j} onSelect={this.setType(i,j)}>
                {types}
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
