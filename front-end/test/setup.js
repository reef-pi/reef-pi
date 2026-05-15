const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

global.ResizeObserver = ResizeObserver

global.matchMedia = global.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  }
}
