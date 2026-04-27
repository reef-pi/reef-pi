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

async function createSmokeApi (baseURL = 'http://127.0.0.1:8080') {
  return playwrightRequest.newContext({
    baseURL,
    storageState: authFile,
    extraHTTPHeaders: {
      Accept: 'application/json'
    }
  })
}

async function jsonRequest (api, method, path, payload) {
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

async function resetSmokeState (api) {
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

async function listItems (api, path) {
  const items = await jsonRequest(api, 'GET', path)
  return Array.isArray(items) ? items : []
}

async function createDriver (api, driver) {
  await jsonRequest(api, 'PUT', '/api/drivers', driver)
  const drivers = await listItems(api, '/api/drivers')
  return drivers.find(item => item.name === driver.name)
}

async function createOutlet (api, outlet) {
  await jsonRequest(api, 'PUT', '/api/outlets', outlet)
  const outlets = await listItems(api, '/api/outlets')
  return outlets.find(item => item.name === outlet.name)
}

async function createEquipment (api, equipment) {
  await jsonRequest(api, 'PUT', '/api/equipment', equipment)
  const equipmentItems = await listItems(api, '/api/equipment')
  return equipmentItems.find(item => item.name === equipment.name)
}

async function createInlet (api, inlet) {
  await jsonRequest(api, 'PUT', '/api/inlets', inlet)
  const inlets = await listItems(api, '/api/inlets')
  return inlets.find(item => item.name === inlet.name)
}

async function createJack (api, jack) {
  await jsonRequest(api, 'PUT', '/api/jacks', jack)
  const jacks = await listItems(api, '/api/jacks')
  return jacks.find(item => item.name === jack.name)
}

async function createAnalogInput (api, input) {
  await jsonRequest(api, 'PUT', '/api/analog_inputs', input)
  const inputs = await listItems(api, '/api/analog_inputs')
  return inputs.find(item => item.name === input.name)
}

async function createMacro (api, macro) {
  await jsonRequest(api, 'PUT', '/api/macros', macro)
  const macros = await listItems(api, '/api/macros')
  return macros.find(item => item.name === macro.name)
}

async function createTimer (api, timer) {
  await jsonRequest(api, 'PUT', '/api/timers', timer)
  const timers = await listItems(api, '/api/timers')
  return timers.find(item => item.name === timer.name)
}

async function createLight (api, light) {
  await jsonRequest(api, 'PUT', '/api/lights', light)
  const lights = await listItems(api, '/api/lights')
  return lights.find(item => item.name === light.name)
}

async function createPhProbe (api, probe) {
  await jsonRequest(api, 'PUT', '/api/phprobes', probe)
  const probes = await listItems(api, '/api/phprobes')
  return probes.find(item => item.name === probe.name)
}

async function createAto (api, ato) {
  await jsonRequest(api, 'PUT', '/api/atos', ato)
  const atos = await listItems(api, '/api/atos')
  return atos.find(item => item.name === ato.name)
}

async function createDoser (api, doser) {
  await jsonRequest(api, 'PUT', '/api/doser/pumps', doser)
  const dosers = await listItems(api, '/api/doser/pumps')
  return dosers.find(item => item.name === doser.name)
}

async function createTemperatureController (api, tc) {
  await jsonRequest(api, 'PUT', '/api/tcs', tc)
  const tcs = await listItems(api, '/api/tcs')
  return tcs.find(item => item.name === tc.name)
}

async function updateDashboard (api, payload) {
  await jsonRequest(api, 'POST', '/api/dashboard', payload)
}

async function seedConfiguration (api) {
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

async function seedFullSmokeConfiguration (api) {
  await resetSmokeState(api)

  const pca9685 = await createDriver(api, {
    name: 'pca9685',
    type: 'pca9685',
    config: {
      address: 64,
      frequency: 1100
    }
  })
  const phDriver = await createDriver(api, {
    name: 'ph',
    type: 'ph-board',
    config: {
      address: 69
    }
  })
  const hs103 = await createDriver(api, {
    name: 'hs103',
    type: 'hs103',
    config: {
      address: '192.168.1.1:9999'
    }
  })

  const outlets = []
  for (const outlet of [
    { name: 'O1', pin: 6, driver: 'rpi', reverse: false },
    { name: 'O2', pin: 12, driver: 'rpi', reverse: false },
    { name: 'O3', pin: 13, driver: 'rpi', reverse: false },
    { name: 'O4', pin: 19, driver: 'rpi', reverse: false },
    { name: 'O5', pin: 16, driver: 'rpi', reverse: false },
    { name: 'O6', pin: 26, driver: 'rpi', reverse: false },
    { name: 'O7', pin: 20, driver: 'rpi', reverse: false },
    { name: 'O8', pin: 21, driver: 'rpi', reverse: false }
  ]) {
    outlets.push(await createOutlet(api, outlet))
  }

  const inlets = []
  for (const inlet of [
    { name: 'I1', pin: 25, driver: 'rpi', reverse: false },
    { name: 'I2', pin: 23, driver: 'rpi', reverse: false },
    { name: 'I3', pin: 27, driver: 'rpi', reverse: false }
  ]) {
    inlets.push(await createInlet(api, inlet))
  }

  const jacks = []
  for (const jack of [
    { name: 'J0', pins: [0], driver: pca9685.id },
    { name: 'J1', pins: [0, 1], driver: pca9685.id }
  ]) {
    jacks.push(await createJack(api, jack))
  }

  const analogInputs = []
  for (const input of [
    { name: 'AI1', pin: 0, driver: phDriver.id },
    { name: 'AI2', pin: 0, driver: phDriver.id }
  ]) {
    analogInputs.push(await createAnalogInput(api, input))
  }

  const equipment = []
  for (const item of [
    { name: 'Return', outlet: outlets[0].id },
    { name: 'Light', outlet: outlets[1].id },
    { name: 'Heater', outlet: outlets[2].id },
    { name: 'Skimmer', outlet: outlets[3].id },
    { name: 'Fan', outlet: outlets[4].id },
    { name: 'ATO Pump', outlet: outlets[5].id }
  ]) {
    equipment.push(await createEquipment(api, item))
  }

  const feedStart = await createMacro(api, {
    name: 'Feed Start',
    steps: [
      { type: 'equipment', config: { id: equipment[0].id, on: false } },
      { type: 'wait', config: { duration: 300 } },
      { type: 'equipment', config: { id: equipment[0].id, on: true } }
    ]
  })
  const waterChange = await createMacro(api, {
    name: 'Water Change',
    steps: [
      { type: 'equipment', config: { id: equipment[0].id, on: false } },
      { type: 'wait', config: { duration: 300 } },
      { type: 'equipment', config: { id: equipment[0].id, on: true } }
    ]
  })

  const timer = await createTimer(api, {
    name: 'Nightly Skimmer Run',
    enable: true,
    type: 'equipment',
    month: '*',
    week: '?',
    day: '*',
    hour: '22',
    minute: '2',
    second: '5',
    target: {
      id: equipment[3].id,
      on: true,
      revert: true,
      duration: 60
    }
  })

  const light = await createLight(api, {
    name: 'Kessil A360',
    jack: jacks[0].id,
    enable: true,
    channels: {
      0: {
        name: 'Channel-1',
        pin: 0,
        color: '#000000',
        manual: false,
        min: 0,
        max: 100,
        value: 0,
        profile: {
          type: 'interval',
          config: {
            start: '10:00:00',
            end: '14:00:00',
            interval: 14400,
            values: [0, 100]
          }
        }
      }
    }
  })

  const phProbe = await createPhProbe(api, {
    name: 'Biocube29 pH',
    enable: false,
    period: 5,
    analog_input: analogInputs[0].id,
    control: true,
    is_macro: true,
    min: 7.5,
    max: 8.5,
    downer_eq: feedStart.id,
    upper_eq: waterChange.id,
    hysteresis: 0.1,
    notify: { enable: false, min: 7, max: 9 },
    chart: { ymin: 0, ymax: 14, color: '#0066cc', unit: 'pH' }
  })

  const ato = await createAto(api, {
    name: 'Biocube29 ATO',
    enable: true,
    period: 90,
    inlet: inlets[0].id,
    control: true,
    pump: equipment[5].id,
    notify: { enable: false, max: 0 }
  })

  const doser = await createDoser(api, {
    name: 'Two Part - CaCO3',
    type: 'dcpump',
    jack: jacks[1].id,
    pin: 0,
    regiment: {
      enable: true,
      schedule: {
        month: '*',
        week: '?',
        day: '*',
        hour: '1,9,17',
        minute: '1',
        second: '1'
      },
      duration: 15,
      speed: 50,
      volume: 0,
      volume_per_second: 0,
      continuous: false,
      soft_start: 0
    }
  })

  const temperature = await createTemperatureController(api, {
    name: 'Biocube29 Temperature',
    enable: true,
    period: 120,
    control: true,
    heater: equipment[2].id,
    cooler: equipment[4].id,
    min: 78.5,
    max: 79.3,
    hysteresis: 0.1,
    sensor: '28-devmodeenable',
    fahrenheit: true,
    notify: { enable: false, min: 77, max: 82 },
    chart: { ymin: 70, ymax: 90, color: '#ff0000' }
  })

  await updateDashboard(api, {
    row: 3,
    column: 2,
    width: 500,
    height: 300,
    grid_details: [
      [
        { type: 'temp_current', id: temperature.id },
        { type: 'ph_current', id: phProbe.id }
      ],
      [
        { type: 'ato', id: ato.id },
        { type: 'equipment_ctrlpanel', id: 'current' }
      ],
      [
        { type: 'lights', id: light.id },
        { type: 'health', id: 'current' }
      ]
    ]
  })

  return {
    drivers: { pca9685, ph: phDriver, hs103 },
    outlets,
    inlets,
    jacks,
    analogInputs,
    equipment,
    macros: [feedStart, waterChange],
    timer,
    light,
    phProbe,
    ato,
    doser,
    temperature
  }
}

async function seedDashboard (api) {
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
  seedFullSmokeConfiguration,
  seedDashboard
}
