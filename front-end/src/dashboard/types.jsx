import i18next from 'i18next'

export const buildCells = (rows, columns, cells) => {
  const pCells = []
  let i, j
  for (i = 0; i < rows; i++) {
    const row = []
    for (j = 0; j < columns; j++) {
      const cell = {
        type: 'blank_panel',
        id: 'none'
      }
      if (cells[i] !== undefined && cells[i][j] !== undefined) {
        cell.type = cells[i][j].type || 'blank_panel'
        cell.id = cells[i][j].id || 'none'
      }
      row.push(cell)
    }
    pCells.push(row)
  }
  return (pCells)
}

export const buildTypeMap = (props) => {
  if (props === undefined) {
    props = {}
  }
  const validTypes = {
    ato: {
      name: 'ato',
      label: i18next.t('ato'),
      options: props.atos || []
    },
    equipment: {
      name: 'equipment',
      label: i18next.t('equipment'),
      options: []
    },
    equipment_barchart: {
      name: 'equipment_barchart',
      label: i18next.t('equipment:chart:barchart'),
      options: []
    },
    equipment_ctrlpanel: {
      name: 'equipment_ctrlpanel',
      label: i18next.t('equipment:chart:ctrlpanel'),
      options: props.equipment || []
    },
    blank_panel: {
      name: 'blank_panel',
      label: i18next.t('dashboard:blank_panel'),
      options: [{ id: 'none', name: i18next.t('none') }]
    },
    health: {
      name: 'health',
      label: i18next.t('health'),
      options: [{ id: 'current', name: i18next.t('health_chart:current') }, { id: 'historical', name: i18next.t('health_chart:historical') }]
    },
    lights: {
      name: 'lights',
      label: i18next.t('lights'),
      options: props.lights || []
    },
    ph_current: {
      name: 'ph_current',
      label: i18next.t('ph:chart:current'),
      options: props.phs || []
    },
    ph_historical: {
      name: 'ph_historical',
      label: i18next.t('ph:chart:historical'),
      options: props.phs || []
    },
    temp_current: {
      name: 'temp_current',
      label: i18next.t('temperature:chart:current'),
      options: props.tcs || []
    },
    temp_historical: {
      name: 'temp_historical',
      label: i18next.t('temperature:chart:historical'),
      options: props.tcs || []
    },
    doser: {
      name: 'doser',
      label: i18next.t('doser'),
      options: props.dosers || []
    }
  }
  return (validTypes)
}
