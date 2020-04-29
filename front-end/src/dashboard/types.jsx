import i18next from 'i18next'

export const buildCells = (rows, columns, cells) => {
  const pCells = []
  let i, j
  for (i = 0; i < rows; i++) {
    const row = []
    for (j = 0; j < columns; j++) {
      const cell = {
        type: 'health',
        id: 'current'
      }
      if (cells[i] !== undefined && cells[i][j] !== undefined) {
        cell.type = cells[i][j].type || 'health'
        cell.id = cells[i][j].id || 'current'
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
    health: {
      name: 'health',
      label: i18next.t('health'),
      options: [{ id: 'current', name: 'current' }, { id: 'historical', name: 'historical' }]
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
