const fs = require('fs').promises
const path = require('path')

const exactSensitiveKeys = new Set([
  'authorization',
  'cookie',
  'password',
  'pass',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'secret',
  'session',
  'authtoken'
])

function captureEnabled () {
  return process.env.REEF_PI_E2E_CAPTURE_API === '1' && process.env.CI !== 'true'
}

function isSensitiveKey (key) {
  const normalized = key.toLowerCase()
  const compact = normalized.replace(/[^a-z0-9]/g, '')
  return exactSensitiveKeys.has(normalized) ||
    normalized.includes('token') ||
    normalized.includes('password') ||
    normalized.includes('secret') ||
    normalized.includes('session') ||
    normalized.includes('cookie') ||
    normalized.includes('authorization') ||
    normalized.includes('auth') ||
    normalized.includes('api_key') ||
    normalized.includes('apikey') ||
    compact.includes('apikey') ||
    normalized.includes('pass')
}

function redact (value) {
  if (Array.isArray(value)) {
    return value.map(redact)
  }

  if (value === null || typeof value !== 'object') {
    return value
  }

  const redacted = {}
  for (const [key, child] of Object.entries(value)) {
    redacted[key] = isSensitiveKey(key) ? '[REDACTED]' : redact(child)
  }
  return redacted
}

async function safeRequestPostDataJSON (request) {
  try {
    const json = await request.postDataJSON()
    return json
  } catch (error) {
    return null
  }
}

async function safeResponseJSON (response) {
  try {
    return await response.json()
  } catch (error) {
    return null
  }
}

function requestBody (request) {
  return safeRequestPostDataJSON(request).then((json) => {
    return json === null ? null : redact(json)
  })
}

async function responseBody (response) {
  try {
    const contentType = response.headers()['content-type'] || ''
    if (!contentType.toLowerCase().includes('application/json')) {
      return null
    }

    return redact(await safeResponseJSON(response))
  } catch (error) {
    return null
  }
}

function decodedKey (key) {
  try {
    return decodeURIComponent(key.replace(/\+/g, ' '))
  } catch (error) {
    return key
  }
}

function redactQuery (search) {
  if (search === '') {
    return ''
  }

  const query = search.startsWith('?') ? search.slice(1) : search
  const redacted = query.split('&').map((part) => {
    const separator = part.indexOf('=')
    const key = separator === -1 ? part : part.slice(0, separator)
    if (!isSensitiveKey(decodedKey(key))) {
      return part
    }

    return separator === -1 ? key : `${key}=[REDACTED]`
  })

  return `?${redacted.join('&')}`
}

function safeCaptureName (name) {
  const safeName = String(name || '')
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/\.\.+/g, '-')
  return safeName === '' || safeName === '.' ? 'api-capture' : safeName
}

function apiUrl (url) {
  try {
    const parsed = new URL(url)
    if (!parsed.pathname.startsWith('/api/')) {
      return null
    }

    return parsed
  } catch (error) {
    return null
  }
}

function startApiCapture (page, name) {
  if (!captureEnabled()) {
    return { stop: async () => {} }
  }

  const captures = []
  const pending = new Set()

  async function captureResponse (response) {
    const parsed = apiUrl(response.url())
    if (parsed === null) {
      return
    }

    const request = response.request()
    captures.push({
      method: request.method(),
      path: parsed.pathname,
      query: redactQuery(parsed.search),
      request: await requestBody(request),
      status: response.status(),
      response: await responseBody(response)
    })
  }

  function onResponse (response) {
    const capture = captureResponse(response).catch(() => {}).finally(() => {
      pending.delete(capture)
    })
    pending.add(capture)
  }

  page.on('response', onResponse)

  return {
    stop: async () => {
      page.off('response', onResponse)
      await Promise.all(Array.from(pending))

      const dir = path.join(process.cwd(), 'test-results', 'playwright', 'api-captures')
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(
        path.join(dir, `${safeCaptureName(name)}.json`),
        `${JSON.stringify(captures, null, 2)}\n`
      )
    }
  }
}

module.exports = {
  redact,
  startApiCapture
}
