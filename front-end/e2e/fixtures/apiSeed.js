const { request: playwrightRequest, expect } = require('@playwright/test')
const { authFile } = require('./authFile')
const resetCollections = [
  '/api/tcs',
  '/api/doser/pumps',
  '/api/atos',
  '/api/phprobes',
  '/api/macros',
  '/api/lights',
  '/api/timers',
  '/api/equipment',
  '/api/analog_inputs',
  '/api/jacks',
  '/api/inlets',
  '/api/outlets',
  '/api/drivers'
]

async function createSmokeApi(baseURL = 'http://127.0.0.1:8080') {
  return playwrightRequest.newContext({
    baseURL,
    storageState: authFile,
    extraHTTPHeaders: {
      Accept: 'application/json'
    }
  })
}

async function jsonRequest(api, method, path, payload) {
  const response = await api.fetch(path, {
    method,
    data: payload
  })

  expect(response.ok(), `${method} ${path} should succeed`).toBeTruthy()

  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch (_) {
    return text
  }
}

async function resetSmokeState(api) {
  for (const path of resetCollections) {
    const items = await listItems(api, path)
    for (const item of items) {
      if (item && item.id && item.id !== 'rpi' && !item.readonly) {
        await jsonRequest(api, 'DELETE', `${path}/${item.id}`)
      }
    }
  }

  await jsonRequest(api, 'POST', '/api/dev/smoke/reset')
}

async function listItems(api, path) {
  const items = await jsonRequest(api, 'GET', path)
  return Array.isArray(items) ? items : []
}

async function createDriver(api, driver) {
  await jsonRequest(api, 'PUT', '/api/drivers', driver)
  const drivers = await listItems(api, '/api/drivers')
  return drivers.find(item => item.name === driver.name)
}

async function createOutlet(api, outlet) {
  await jsonRequest(api, 'PUT', '/api/outlets', outlet)
  const outlets = await listItems(api, '/api/outlets')
  return outlets.find(item => item.name === outlet.name)
}

async function createEquipment(api, equipment) {
  await jsonRequest(api, 'PUT', '/api/equipment', equipment)
  const equipmentItems = await listItems(api, '/api/equipment')
  return equipmentItems.find(item => item.name === equipment.name)
}

async function updateDashboard(api, payload) {
  await jsonRequest(api, 'POST', '/api/dashboard', payload)
}

async function seedConfiguration(api) {
  await resetSmokeState(api)

  const pca9685 = await createDriver(api, {
    name: 'pca9685',
    type: 'pca9685',
    config: {
      address: 64,
      frequency: 1100
    }
  })
  await createDriver(api, {
    name: 'ph',
    type: 'ph-board',
    config: {
      address: 69
    }
  })
  await createDriver(api, {
    name: 'hs103',
    type: 'hs103',
    config: {
      address: '192.168.1.1:9999'
    }
  })

  const outlets = []
  for (const outlet of [
    { name: 'O1', pin: 6, driver: 'rpi', reverse: false },
    { name: 'O2', pin: 12, driver: 'rpi', reverse: false }
  ]) {
    outlets.push(await createOutlet(api, outlet))
  }

  const equipment = []
  equipment.push(await createEquipment(api, { name: 'Return', outlet: outlets[0].id }))
  equipment.push(await createEquipment(api, { name: 'Light', outlet: outlets[1].id }))

  return {
    drivers: {
      pca9685
    },
    outlets,
    equipment
  }
}

async function seedDashboard(api) {
  const seeded = await seedConfiguration(api)
  await updateDashboard(api, {
    row: 1,
    column: 2,
    width: 500,
    height: 300,
    grid_details: [[
      { type: 'equipment_ctrlpanel', id: 'current' },
      { type: 'health', id: 'current' }
    ]]
  })
  return seeded
}

module.exports = {
  createSmokeApi,
  resetSmokeState,
  seedConfiguration,
  seedDashboard
}
