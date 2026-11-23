const path = require('path')
const { GUIDE_FOLDERS, VIEWPORTS, viewportName, guideImagePath, CAPTURE_CSS } = require('./guideCapture')

test('builds stable image paths per guide, page, slot and viewport', () => {
  const desktop = guideImagePath(3, 'configuration-testing', 2, 'temperature-new-controller', 'desktop')
  expect(desktop.endsWith(path.join('docs', 'guides', '03-temperature-controller', 'images', 'configuration-testing-02-temperature-new-controller-desktop.png'))).toBe(true)
  expect(guideImagePath(3, 'configuration-testing', '03a', 'x', 'mobile')).toMatch(/configuration-testing-03a-x-mobile\.png$/)
  expect(guideImagePath(3, 'configuration-testing', 2, 'temperature-new-controller', 'desktop')).toBe(desktop)
})

test('rejects unknown guides, viewports and unsafe names', () => {
  expect(() => guideImagePath(8, 'p', 1, 'x', 'desktop')).toThrow()
  expect(() => guideImagePath(3, 'p', 1, 'x', 'tablet')).toThrow()
  expect(() => guideImagePath(3, 'p', 1, 'Bad Name', 'desktop')).toThrow()
})

test('maps project names to viewports', () => {
  expect(viewportName('guide-screenshots-desktop')).toBe('desktop')
  expect(viewportName('guide-screenshots-mobile')).toBe('mobile')
  expect(() => viewportName('smoke-chromium')).toThrow()
  expect(VIEWPORTS.desktop).toEqual({ width: 1440, height: 900 })
  expect(VIEWPORTS.mobile).toEqual({ width: 390, height: 844 })
  expect(Object.keys(GUIDE_FOLDERS)).toHaveLength(7)
  expect(CAPTURE_CSS).toContain('.bottom-bar')
})
