import { buildCells, buildTypeMap } from './types'

describe('buildCells', () => {
  it('fills a grid with blank_panel when no cells provided', () => {
    const result = buildCells(2, 2, [])
    expect(result.length).toBe(2)
    expect(result[0].length).toBe(2)
    expect(result[0][0].type).toBe('blank_panel')
    expect(result[0][0].id).toBe('none')
  })

  it('preserves existing cell data', () => {
    const cells = [[{ type: 'equipment', id: '1' }, { type: 'ato', id: '2' }]]
    const result = buildCells(1, 2, cells)
    expect(result[0][0].type).toBe('equipment')
    expect(result[0][0].id).toBe('1')
    expect(result[0][1].type).toBe('ato')
    expect(result[0][1].id).toBe('2')
  })

  it('fills missing cells with blank_panel when row is shorter than columns', () => {
    const cells = [[{ type: 'ato', id: '1' }]]
    const result = buildCells(1, 2, cells)
    expect(result[0][0].type).toBe('ato')
    expect(result[0][1].type).toBe('blank_panel')
  })

  it('defaults type to blank_panel when cell type is undefined', () => {
    const cells = [[{ id: '1' }]]
    const result = buildCells(1, 1, cells)
    expect(result[0][0].type).toBe('blank_panel')
    expect(result[0][0].id).toBe('1')
  })
})

describe('buildTypeMap', () => {
  it('returns an object with all expected panel types', () => {
    const typeMap = buildTypeMap({})
    const expectedTypes = [
      'journal', 'ato', 'equipment', 'equipment_barchart', 'equipment_ctrlpanel',
      'blank_panel', 'health', 'lights', 'ph_current', 'ph_historical',
      'ph_usage', 'temp_current', 'temp_historical', 'doser'
    ]
    expectedTypes.forEach(type => {
      expect(typeMap).toHaveProperty(type)
    })
  })

  it('uses provided props arrays', () => {
    const props = {
      journals: [{ id: '1', name: 'J1' }],
      equipment: [{ id: '2', name: 'E1' }],
      lights: [{ id: '3', name: 'L1' }]
    }
    const typeMap = buildTypeMap(props)
    expect(typeMap.journal.options).toEqual(props.journals)
    expect(typeMap.equipment_ctrlpanel.options).toEqual(props.equipment)
    expect(typeMap.lights.options).toEqual(props.lights)
  })

  it('handles undefined props gracefully', () => {
    const typeMap = buildTypeMap(undefined)
    expect(typeMap.journal.options).toEqual([])
    expect(typeMap.ato.options).toEqual([])
  })

  it('blank_panel has a none option', () => {
    const typeMap = buildTypeMap({})
    expect(typeMap.blank_panel.options[0].id).toBe('none')
  })

  it('health has current and historical options', () => {
    const typeMap = buildTypeMap({})
    const ids = typeMap.health.options.map(o => o.id)
    expect(ids).toContain('current')
    expect(ids).toContain('historical')
  })
})
