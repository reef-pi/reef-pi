const drivers = {
  pwm: { name: 'pca9685', type: 'pca9685', address: '64', frequency: '1100' },
  ph: { name: 'ph', type: 'ph-board', address: '69' },
  hs103: { name: 'hs103', type: 'hs103', address: '192.168.1.1:9999' }
}

const connectors = {
  outlets: [
    { name: 'O1', pin: '6' },
    { name: 'O2', pin: '12' },
    { name: 'O3', pin: '13' },
    { name: 'O4', pin: '19' },
    { name: 'O5', pin: '16' },
    { name: 'O6', pin: '26' },
    { name: 'O7', pin: '20' },
    { name: 'O8', pin: '21' }
  ],
  inlets: [
    { name: 'I1', pin: '25' },
    { name: 'I2', pin: '23' },
    { name: 'I3', pin: '27' }
  ],
  jacks: [
    { name: 'J0', pins: '0', driver: 'pca9685' },
    { name: 'J1', pins: '1', driver: 'pca9685' },
    { name: 'J2', pins: '2', driver: 'pca9685' },
    { name: 'J3', pins: '3', driver: 'pca9685' }
  ],
  analogInputs: [
    { name: 'AI1', pin: '0', driver: 'ph' },
    { name: 'AI2', pin: '0', driver: 'ph' }
  ]
}

const equipment = [
  { name: 'Return', outlet: 'O1' },
  { name: 'Light', outlet: 'O2' },
  { name: 'Heater', outlet: 'O3' },
  { name: 'Skimmer', outlet: 'O4' },
  { name: 'Fan', outlet: 'O5' },
  { name: 'ATO Pump', outlet: 'O6' }
]

const modules = {
  lights: [
    {
      name: 'Kessil Fixed',
      jack: 'J0',
      profile: 'fixed',
      start: '08:00:00',
      end: '20:00:00',
      value: '65'
    },
    {
      name: 'Kessil Interval',
      jack: 'J1',
      profile: 'interval',
      start: '10:00:00',
      end: '14:00:00',
      values: ['0', '50', '100']
    },
    {
      name: 'Kessil Diurnal',
      jack: 'J2',
      profile: 'diurnal',
      start: '06:00:00',
      end: '21:00:00'
    }
  ],
  ph: {
    name: 'Biocube29 pH',
    period: '5',
    analogInput: 'AI1',
    min: '7.5',
    max: '8.5',
    control: 'equipment',
    lowerFunction: 'Heater',
    upperFunction: 'Fan'
  },
  ato: {
    name: 'Biocube29 ATO',
    inlet: 'I1',
    period: '90',
    pump: 'ATO Pump'
  },
  doser: {
    name: 'Two Part - CaCO3',
    jack: 'J3',
    pin: '3',
    hour: '1,9,17',
    minute: '1',
    second: '1',
    duration: '15',
    speed: '50'
  },
  stepperDoser: {
    name: 'Stepper Alk',
    volume: '5',
    hour: '2',
    minute: '15',
    second: '0',
    stepPin: 'O1',
    directionPin: 'O2',
    msPinA: 'O3',
    msPinB: 'O4',
    msPinC: 'O5',
    spr: '200',
    vpr: '1.5',
    delay: '1000',
    direction: 'true',
    microstepping: 'Full'
  },
  temperature: {
    name: 'Biocube29 Temperature',
    sensor: '28-devmodeenable',
    period: '120',
    heater: 'Heater',
    cooler: 'Fan',
    min: '78.5',
    max: '79.3'
  }
}

module.exports = {
  drivers,
  connectors,
  equipment,
  modules
}
