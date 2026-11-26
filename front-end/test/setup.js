const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
// jsdom does not provide web streams; fetch-mock 12 uses ReadableStream to build responses.
global.ReadableStream = global.ReadableStream || require('stream/web').ReadableStream

// jsdom has no fetch API; install the polyfill, then point fetch-mock (12+) at it.
// fetch-mock reads Request/Response/Headers when it is first imported, which happens
// before a test file's own `import 'isomorphic-fetch'` runs.
require('isomorphic-fetch')
const fetchMock = require('fetch-mock').default
Object.assign(fetchMock.config, {
  fetch: globalThis.fetch,
  Request: globalThis.Request,
  Response: globalThis.Response,
  Headers: globalThis.Headers
})

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
