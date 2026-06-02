import React from 'react'
import ComponentSelector from './component_selector'
import { buildTypeMap, buildCells } from './types'
import i18next from 'i18next'
import { Menu } from '../../design-system/ui_kits/reef-pi-app/primitives/Interaction'

export const numColsToColSize = (numCols) => {
  /*
  Given a number of columns, returns the maximum bootstrap column size in order
  to fit all columns on one row

  i.e. 1->12, 2->6, 3->4, 4->3, 5->2, 6->2, 7->1, 8->1, 9->1, 10->1, 11->1, 12->1
  */
  let colSize = 1
  if (numCols <= 12) { colSize = Math.floor(12 / numCols) }
  return colSize
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

    return (
      <div className='grid-cell-container' style={{ flex: '1 1 0', minWidth: 0 }} key={'chart-type-' + i + '-' + j}>
        <div className='grid-cell'>
          <div style={{ marginBottom: 'var(--reefpi-space-xs)' }}>
            <Menu
              buttonLabel={label}
              items={this.menuItems(i, j)}
            />
          </div>
          <div style={{ marginTop: 'var(--reefpi-space-xs)' }}>
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
      const cells = this.state.cells.slice()
      const row = cells[i] ? cells[i].slice() : []
      const cell = row[j] ? { ...row[j] } : {}
      cell.id = id
      row[j] = cell
      cells[i] = row
      this.setState({ cells })
      this.props.hook(cells)
    }.bind(this))
  }

  setType (i, j, type) {
    return (function () {
      const cells = this.state.cells.slice()
      const row = cells[i] ? cells[i].slice() : []
      const cell = row[j] ? { ...row[j] } : {}
      cell.type = type
      row[j] = cell
      cells[i] = row
      this.setState({ cells })
      this.props.hook(cells)
    }.bind(this))
  }

  menuItem (type, active, i, j) {
    if (type === undefined) {
      return null
    }
    const label = type.label || '-'
    return {
      label,
      onSelect: this.setType(i, j, type.name)
    }
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
    ].filter(Boolean)
    return types
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
        <div className='grid-row' style={{ display: 'flex', gap: 'var(--reefpi-space-sm)', flexWrap: 'wrap' }} key={'chart-row-' + i}>
          <label style={{ display: 'block' }}>Row {i + 1}</label>
          {columns}
        </div>
      )
    }
    return (
      <div className='reef-pi-grid' style={{ width: '100%' }}>
        <label> {i18next.t('charts')} </label>
        {rows}
      </div>
    )
  }
}
