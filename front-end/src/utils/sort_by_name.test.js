import { SortByName } from './sort_by_name'

describe('SortByName', () => {
  it('sorts alphabetically', () => {
    const items = [{ name: 'Zebra' }, { name: 'Apple' }, { name: 'Mango' }]
    const sorted = items.sort(SortByName)
    expect(sorted.map(i => i.name)).toEqual(['Apple', 'Mango', 'Zebra'])
  })

  it('sorts numerically when names contain numbers', () => {
    const items = [{ name: 'item10' }, { name: 'item2' }, { name: 'item1' }]
    const sorted = items.sort(SortByName)
    expect(sorted.map(i => i.name)).toEqual(['item1', 'item2', 'item10'])
  })

  it('returns 0 for equal names', () => {
    expect(SortByName({ name: 'same' }, { name: 'same' })).toBe(0)
  })

  it('returns negative when a comes before b', () => {
    expect(SortByName({ name: 'Apple' }, { name: 'Zebra' })).toBeLessThan(0)
  })

  it('returns positive when a comes after b', () => {
    expect(SortByName({ name: 'Zebra' }, { name: 'Apple' })).toBeGreaterThan(0)
  })
})
