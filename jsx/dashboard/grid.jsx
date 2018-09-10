import React from 'react'
import ComponentSelector from './component_selector'

// props: rows, columns, hook, cells, tcs, atos
export default class Grid extends React.Component {
  constructor (props) {
    super(props)
    var i, j
    var cells = []
    for (i = 0; i < props.rows; i++) {
      cells[i] = []
      for (j = 0; j < props.columns; j++) {
        if (props.cells[i] === undefined || props.cells[i][j] === undefined) {
          cells[i][j] = {type: 'health'}
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

  cellUI (type, currentId, i, j) {
    var data
    switch (type) {
      case 'ato':
        data = this.props.atos
        break
      case 'equipment':
        return (<span>-</span>)
      case 'health':
        data = [{id: 'current', name: 'current'}, {id: 'historical', name: 'historical'}]
        break
      case 'light':
        data = this.props.lights
        break
      case 'ph-current':
      case 'ph-historical':
        data = this.props.phs
        break
      case 'temperature':
      case 'tc':
        data = this.props.tcs
        break
    }

    return (
      <ComponentSelector
        components={data}
        hook={this.updateHook(i, j)}
        selector_id={'component-' + type + '-' + i + '-' + j}
        current_id={currentId}
      />
    )
  }

  initiatlizeCell (i, j) {
    var cells = this.state.cells
    if (cells === undefined) {
      cells = []
    }
    if (cells[i] === undefined) {
      cells[i] = []
    }
    for (j = 0; j < this.props.columns; j++) {
      if (cells[i][j] === undefined) {
        cells[i][j] = {
          type: 'health'
        }
      }
      cells[i][j].ui = this.cellUI(cells[i][j].type, cells[i][j].id, i, j)
    }
    return (cells)
  }

  updateHook (i, j) {
    return (function (id) {
      var cells = this.state.cells
      cells[i][j].id = id
      this.setState({cells: cells})
      this.props.hook(cells)
    }.bind(this))
  }

  setType (i, j, type) {
    return (function () {
      var cells = this.initiatlizeCell(i, j)
      cells[i][j].type = type
      cells[i][j].ui = this.cellUI(type, '', i, j)
      this.setState({cells: cells})
      this.props.hook(cells)
    }.bind(this))
  }

  menuItem (type, a, i, j) {
    var cName = 'dropdown-item'
    if (a) {
      cName += ' active'
    }
    return (
      <a className={cName} href='#' onClick={this.setType(i, j, type)} key={type + '-chart-' + i + '-' + j}>
        <span id={type + '-chart-' + i + '-' + j}>{type}</span>
      </a>
    )
  }

  menuItems (i, j) {
    var types = [
      this.menuItem('ato', false, i, j),
      this.menuItem('equipment', false, i, j),
      this.menuItem('health', false, i, j),
      this.menuItem('light', false, i, j),
      this.menuItem('ph-current', false, i, j),
      this.menuItem('ph-historical', false, i, j),
      this.menuItem('tc', false, i, j),
      this.menuItem('temperature', false, i, j)
    ]
    return (types)
  }

  render () {
    var rows = []
    var i, j
    var cells = this.state.cells
    if (cells === undefined) {
      cells = []
    }
    for (i = 0; i < this.props.rows; i++) {
      var columns = []
      for (j = 0; j < this.props.columns; j++) {
        cells = this.initiatlizeCell(i, j)
        columns.push(
          <div className='col-sm-3' key={'chart-type-' + i + '-' + j} style={{border: '1px solid black'}}>
            <div className='row'>
              <div className='dropdown'>
                <button className='btn btn-secondary dropdown-toggle' type='button' id={'db-' + i + '-' + j} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                  {cells[i][j].type}
                </button>
                <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                  {this.menuItems(i, j)}
                </div>
              </div>
            </div>
            <div className='row'>
              {cells[i][j].ui}
            </div>
          </div>
        )
      }
      rows.push(
        <div className='row' key={'chart-details-' + i + '-' + 'j'}>
          {columns}
        </div>
      )
    }

    return (
      <div className='col-12'>
        <label> Charts </label>
        {rows}
      </div>
    )
  }
}
