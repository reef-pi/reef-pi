import React from 'react'
import ComponentSelector from './component_selector'
import { buildTypeMap, buildCells } from './types'
import i18next from 'i18next'

export const numColsToColSize = (numCols) => {
  /*
  Given a number of columns, returns the maximum bootstrap column size in order
  to fit all columns on one row
  
  i.e. 1->12, 2->6, 3->4, 4->3, 5->2, 6->2, 7->1, 8->1, 9->1, 10->1, 11->1, 12->1
  */
  let colSize = 1;
  if (numCols <= 12)
    colSize = Math.floor(12 / numCols);
  return colSize;
}

// props: rows, columns, hook, cells, tcs, atos
export default class Grid extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      cells: buildCells(props.rows, props.columns, props.cells),
      types: buildTypeMap(props)
    }
    this.setType = this.setType.bind(this)
    this.setID = this.setID.bind(this)
    this.cellUI = this.cellUI.bind(this)
    this.menuItem = this.menuItem.bind(this)
    this.menuItems = this.menuItems.bind(this)
  }

  cellUI (i, j, cell) {
    let label = this.state.types.blank_panel.label
    let options = this.state.types.blank_panel.options
    let id = 'current'
    if (cell === undefined) {
      cell = { type: 'blank_panel', id: 'none' }
    }

    if (this.state.types[cell.type] !== undefined) {
      label = this.state.types[cell.type].label
      options = this.state.types[cell.type].options
      id = cell.id
    }

    let colSize = numColsToColSize(this.props.columns);

    return (
      <div className={'col-xs-12 col-md-' + colSize + ' grid-cell-container'} key={'chart-type-' + i + '-' + j}>
        <div className='grid-cell'>
          <div className='col-12 dropdown'>
            <button className='btn btn-secondary dropdown-toggle' type='button' id={'db-' + i + '-' + j} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
              {label}
            </button>
            <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
              {this.menuItems(i, j)}
            </div>
          </div>
          <div className='col-12 mt-2'>
            <ComponentSelector
              components={options}
              hook={this.setID(i, j)}
              selector_id={'component-' + i + '-' + j}
              current_id={id}
            />
          </div>
        </div>
      </div>
    )
  }

  setID (i, j) {
    return (function (id) {
      const cells = this.state.cells
      const row = cells[i] ? cells[i] : []
      const cell = row[j] ? row[j] : {}
      cell.id = id
      row[j] = cell
      cells[i] = row
      this.setState({ cells: cells })
      this.props.hook(cells)
    }.bind(this))
  }

  setType (i, j, type) {
    return (function () {
      const cells = this.state.cells
      const row = cells[i] ? cells[i] : []
      const cell = row[j] ? row[j] : {}
      cell.type = type
      row[j] = cell
      cells[i] = row
      this.setState({ cells: cells })
      this.props.hook(cells)
    }.bind(this))
  }

  menuItem (type, active, i, j) {
    let cName = 'dropdown-item'
    if (active) {
      cName += ' active'
    }
    if (type === undefined) {
      return (<span>None</span>)
    }
    const label = type.label || '-'
    return (
      <a className={cName} href='#' onClick={this.setType(i, j, type.name)} key={type.name + '-' + i + '-' + j}>
        <span id={type.name + '-' + i + '-' + j}>{label}</span>
      </a>
    )
  }

  menuItems (i, j) {
    const types = [
      this.menuItem(this.state.types.ato, false, i, j),
      this.menuItem(this.state.types.equipment_barchart, false, i, j),
      this.menuItem(this.state.types.equipment_ctrlpanel, false, i, j),
      this.menuItem(this.state.types.health, false, i, j),
      this.menuItem(this.state.types.lights, false, i, j),
      this.menuItem(this.state.types.ph_current, false, i, j),
      this.menuItem(this.state.types.ph_historical, false, i, j),
      this.menuItem(this.state.types.ph_usage, false, i, j),
      this.menuItem(this.state.types.temp_current, false, i, j),
      this.menuItem(this.state.types.temp_historical, false, i, j),
      this.menuItem(this.state.types.doser, false, i, j),
      this.menuItem(this.state.types.journal, false, i, j),
      this.menuItem(this.state.types.blank_panel, false, i, j)
    ]
    return (types)
  }

  render () {
    const cells = buildCells(this.props.rows, this.props.columns, this.state.cells)
    let i, j
    const rows = []
    for (i = 0; i < this.props.rows; i++) {
      const columns = []
      for (j = 0; j < this.props.columns; j++) {
        const cell = cells[i][j]
        columns.push(this.cellUI(i, j, cell))
      }
      rows.push(
        <div className='row grid-row' key={'chart-row-' + i}>
          <label className='d-block d-md-none'>Row {i+1}</label>
          {columns}
        </div>
      )
    }
    return (
      <div className='col-12 reef-pi-grid'>
        <label> {i18next.t('charts')} </label>
        {rows}
      </div>
    )
  }
}
