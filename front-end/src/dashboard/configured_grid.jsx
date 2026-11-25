import React from 'react'
import PropTypes from 'prop-types'
import TempReadingsChart from 'temperature/readings_chart'
import TempControlChart from 'temperature/control_chart'
import EquipmentChart from 'equipment/chart'
import EquipmentCtrlPanel from 'equipment/ctrl_panel'
import BlankPanel from 'dashboard/blank_panel'
import JournalChart from 'journal/chart'
import GenericLightChart from 'lighting/charts/generic'
import ATOChart from 'ato/chart'
import DoserChart from 'doser/chart'
import HealthChart from 'health_chart'
import PhChart from 'ph/chart'
import PhUsageChart from 'ph/control_chart'
import ErrorBoundary from '../ui_components/error_boundary'
import { buildCells } from './types'

// Chart type (as saved by the Configure screen in /api/dashboard) → the chart that renders it and
// the props that bind it to the configured probe, light, doser, ... id.
const CHARTS = {
  temp_current: { Chart: TempReadingsChart, props: id => ({ sensor_id: id }) },
  temp_historical: { Chart: TempControlChart, props: id => ({ sensor_id: id }) },
  ph_current: { Chart: PhChart, props: id => ({ probe_id: id, type: 'current' }) },
  ph_historical: { Chart: PhChart, props: id => ({ probe_id: id, type: 'historical' }) },
  ph_usage: { Chart: PhUsageChart, props: id => ({ probe_id: id, type: 'historical' }) },
  ato: { Chart: ATOChart, props: id => ({ ato_id: id }) },
  doser: { Chart: DoserChart, props: id => ({ doser_id: id }) },
  journal: { Chart: JournalChart, props: id => ({ journal_id: id }) },
  lights: { Chart: GenericLightChart, props: id => ({ light_id: id }) },
  health: { Chart: HealthChart, props: id => ({ trend: id === 'historical' ? 'historical' : 'current' }) },
  equipment_ctrlpanel: { Chart: EquipmentCtrlPanel, props: () => ({}) },
  equipment_barchart: { Chart: EquipmentChart, props: () => ({}) },
  blank_panel: { Chart: BlankPanel, props: () => ({}) }
}

/* Renders the dashboard grid configured under Dashboard › Configure (rows × columns of charts). */
export default function ConfiguredGrid ({ config }) {
  if (!config || !Array.isArray(config.grid_details) || !(config.row > 0) || !(config.column > 0)) {
    return null
  }

  const cells = []
  buildCells(config.row, config.column, config.grid_details).forEach((row, i) => {
    row.forEach((cell, j) => {
      const chart = CHARTS[cell.type]
      if (!chart) return
      const { Chart } = chart
      cells.push(
        <div
          key={`cell-${i}-${j}`}
          className='dashboard-cell'
          data-testid={`dashboard-cell-${i}-${j}`}
          data-chart-type={cell.type}
        >
          <ErrorBoundary>
            <Chart width={config.width} height={config.height} {...chart.props(cell.id)} />
          </ErrorBoundary>
        </div>
      )
    })
  })

  return (
    <div
      className='reefpi-dashboard-grid'
      data-testid='dashboard-grid'
      style={{ '--dashboard-columns': String(config.column) }}
    >
      {cells}
    </div>
  )
}

ConfiguredGrid.propTypes = {
  config: PropTypes.shape({
    row: PropTypes.number,
    column: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    grid_details: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })))
  })
}
