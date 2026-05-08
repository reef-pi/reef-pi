import { SortByName } from 'utils/sort_by_name'

export const groupByDriverName = (connectors, drivers) => {
  const driverMap = {}
  drivers.forEach(d => { driverMap[d.id] = d })

  const groups = {}
  connectors.slice().sort((a, b) => SortByName(a, b))
    .forEach(connector => {
      const driverName = (driverMap[connector.driver] || {}).name || connector.driver
      if (!groups[driverName]) groups[driverName] = []
      groups[driverName].push(connector)
    })

  return {
    driverMap,
    groups: Object.keys(groups).sort().map(driverName => {
      return {
        driverName,
        connectors: groups[driverName]
      }
    })
  }
}
