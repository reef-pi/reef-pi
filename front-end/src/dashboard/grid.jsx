import React from 'react'
import ComponentSelector from './component_selector'
import i18next from 'i18next'

// props: rows, columns, hook, cells, tcs, atos
export default class Grid extends React.Component {
  constructor (props) {
    super(props)
    this.availableTypes = {
      ato: {
        name: 'ato',
        label: i18next.t('ato'),
        options: props.atos
      },
      equipment: {
        name: 'equipment',
        label: i18next.t('equipment'),
        options: []
      },
      health: {
        name: 'health',
        label: i18next.t('health'),
        options: [{ id: 'current', name: 'current' }, { id: 'historical', name: 'historical' }]
      },
      light: {
        name: 'lights',
        label: i18next.t('light'),
        options: props.lights
      },
      ph_current: {
        name: 'ph_current',
        label: i18next.t('ph:chart:current'),
        options: props.phs
      },
      ph_historical: {
        name: 'ph_historical',
        label: i18next.t('ph:chart:historical'),
        options: props.phs
      },
      temp_current: {
        name: 'temp_current',
        label: i18next.t('temperature:chart:current'),
        options: props.tcs
      },
      temp_historical: {
        name: 'temp_historical',
        label: i18next.t('temperature:chart:historical'),
        options: props.tcs
      },
      doser: {
        name: 'doser',
        label: i18next.t('doser'),
        options: props.dosers
      }
    }
    let i, j
    const cells = []
    for (i = 0; i < props.rows; i++) {
      cells[i] = []
      for (j = 0; j < props.columns; j++) {
        if (props.cells[i] === undefined || props.cells[i][j] === undefined) {
          cells[i][j] = { type: 'health' }
          continue
        }
        const cell = props.cells[i][j]
        cells[i][j] = {
          type: this.availableTypes[cell.type],
          id: cell.id
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
    return (
      <ComponentSelector
        components={type.options}
        hook={this.updateHook(i, j)}
        selector_id={'component-' + type.label + '-' + i + '-' + j}
        current_id={currentId}
      />
    )
  }

  initiatlizeCell (i, j) {
    let cells = this.state.cells
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
      const cells = this.state.cells
      cells[i][j].id = id
      this.setState({ cells: cells })
      this.props.hook(cells)
    }.bind(this))
  }

  setType (i, j, type) {
    return (function () {
      const cells = this.initiatlizeCell(i, j)
      cells[i][j].type = type
      cells[i][j].ui = this.cellUI(type, '', i, j)
      this.setState({ cells: cells })
      this.props.hook(cells)
    }.bind(this))
  }

  menuItem (type, a, i, j) {
    let cName = 'dropdown-item'
    if (a) {
      cName += ' active'
    }
    return (
      <a className={cName} href='#' onClick={this.setType(i, j, type)} key={type.name + i + '-' + j}>
        <span id={type + '-chart-' + i + '-' + j}>{type.label}</span>
      </a>
    )
  }

  menuItems (i, j) {
    const types = [
      this.menuItem(this.availableTypes.ato, false, i, j),
      this.menuItem(this.availableTypes.equipment, false, i, j),
      this.menuItem(this.availableTypes.health, false, i, j),
      this.menuItem(this.availableTypes.light, false, i, j),
      this.menuItem(this.availableTypes.ph_current, false, i, j),
      this.menuItem(this.availableTypes.ph_historical, false, i, j),
      this.menuItem(this.availableTypes.temp_current, false, i, j),
      this.menuItem(this.availableTypes.temp_historical, false, i, j),
      this.menuItem(this.availableTypes.doser, false, i, j)
    ]
    return (types)
  }

  render () {
    const rows = []
    let i, j
    let cells = this.state.cells
    if (cells === undefined) {
      cells = []
    }
    for (i = 0; i < this.props.rows; i++) {
      const columns = []
      for (j = 0; j < this.props.columns; j++) {
        cells = this.initiatlizeCell(i, j)
        columns.push(
          <div className='col grid-block' key={'chart-type-' + i + '-' + j}>
            <div className='dropdown'>
              <button className='btn btn-secondary dropdown-toggle' type='button' id={'db-' + i + '-' + j} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                {cells[i][j].type.label}
              </button>
              <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                {this.menuItems(i, j)}
              </div>
            </div>
            <div className='col-2 col-4 col-6'>
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
      <div className='col-12 reef-pi-grid'>
        <label> Charts </label>
        {rows}
      </div>
    )
  }
}
