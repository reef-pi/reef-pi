export const wifiDrivers = ['hs103', 'hs110', 'hs300']
export const i2cDrivers = ['pca9685', 'ph-board', 'ph-ezo', 'pico-board']
export const fileDrivers = ['file-digital', 'file-analog']
export const driverTypes = [...i2cDrivers, ...wifiDrivers, ...fileDrivers]
