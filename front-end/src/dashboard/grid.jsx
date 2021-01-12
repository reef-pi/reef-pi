import React from 'react'
import ComponentSelector from './component_selector'
import { buildTypeMap, buildCells } from './types'
import i18next from 'i18next'

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
    let label = this.state.types.health.label
    let options = this.state.types.health.options
    let id = 'current'
    if (cell === undefined) {
      cell = { type: 'health', id: 'current' }
    }

    if (this.state.types[cell.type] !== undefined) {
      label = this.state.types[cell.type].label
      options = this.state.types[cell.type].options
      id = cell.id
    }
    return (
      <div className='col grid-block' key={'chart-type-' + i + '-' + j}>
        <div className='dropdown'>
          <button className='btn btn-secondary dropdown-toggle' type='button' id={'db-' + i + '-' + j} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
            {label}
          </button>
          <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
            {this.menuItems(i, j)}
          </div>
        </div>
        <div className='col-2 col-4 col-6'>
          <ComponentSelector
            components={options}
            hook={this.setID(i, j)}
            selector_id={'component-' + label + '-' + i + '-' + j}
            current_id={id}
          />
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
        <span id={'menu-chart-' + i + '-' + j}>{label}</span>
      </a>
    )
  }

  menuItems (i, j) {
    const types = [
      this.menuItem(this.state.types.ato, false, i, j),
      // *** added new equipment charts
      //this.menuItem(this.state.types.equipment, false, i, j),
      this.menuItem(this.state.types.equipment_barchart, false, i, j),
      this.menuItem(this.state.types.equipment_ctrlpanel, false, i, j),
      this.menuItem(this.state.types.health, false, i, j),
      this.menuItem(this.state.types.lights, false, i, j),
      this.menuItem(this.state.types.ph_current, false, i, j),
      this.menuItem(this.state.types.ph_historical, false, i, j),
      this.menuItem(this.state.types.temp_current, false, i, j),
      this.menuItem(this.state.types.temp_historical, false, i, j),
      this.menuItem(this.state.types.doser, false, i, j)
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
        <div className='row' key={'chart-row-' + i}>
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
