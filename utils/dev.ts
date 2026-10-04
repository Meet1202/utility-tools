export interface JsonValidationResult {
  isValid: boolean
  error?: string
  line?: number
  column?: number
}

export function validateJson(raw: string): JsonValidationResult {
  if (!raw.trim()) {
    return { isValid: false, error: 'Input is empty' }
  }

  try {
    JSON.parse(raw)
    return { isValid: true }
  } catch (err: any) {
    const message = err.message || 'Invalid JSON'
    // Attempt to extract position
    const match = message.match(/position\s+(\d+)/i)
    let line: number | undefined
    let column: number | undefined

    if (match && match[1]) {
      const pos = parseInt(match[1], 10)
      const lines = raw.slice(0, pos).split('\n')
      line = lines.length
      column = lines[lines.length - 1].length + 1
    }

    return {
      isValid: false,
      error: message,
      line,
      column
    }
  }
}

function deepSortKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(deepSortKeys)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = deepSortKeys(obj[key])
        return acc
      }, {})
  }
  return obj
}

export function formatJson(raw: string, spaceCount = 2, sortKeys = false): string {
  const parsed = JSON.parse(raw)
  const target = sortKeys ? deepSortKeys(parsed) : parsed
  return JSON.stringify(target, null, spaceCount)
}

export function minifyJson(raw: string): string {
  const parsed = JSON.parse(raw)
  return JSON.stringify(parsed)
}

/**
 * UTF-8 safe Base64 encoder
 */
export function encodeBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  let base64 = btoa(binary)
  if (urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  return base64
}

/**
 * UTF-8 safe Base64 decoder
 */
export function decodeBase64(base64: string, urlSafe = false): string {
  let standard = base64.trim()
  if (urlSafe) {
    standard = standard.replace(/-/g, '+').replace(/_/g, '/')
    while (standard.length % 4) {
      standard += '='
    }
  }

  const binary = atob(standard)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

export function encodeUrl(str: string, componentMode = true): string {
  return componentMode ? encodeURIComponent(str) : encodeURI(str)
}

export function decodeUrl(str: string, componentMode = true): string {
  return componentMode ? decodeURIComponent(str) : decodeURI(str)
}

export function parseQueryParams(urlOrQuery: string): Array<{ key: string; value: string }> {
  let search = urlOrQuery.trim()
  if (search.includes('?')) {
    search = search.split('?')[1]
  }
  if (search.startsWith('#')) {
    search = search.slice(1)
  }

  const params: Array<{ key: string; value: string }> = []
  if (!search) return params

  const pairs = search.split('&')
  for (const pair of pairs) {
    if (!pair) continue
    const [rawKey, ...rest] = pair.split('=')
    const rawVal = rest.join('=')
    try {
      params.push({
        key: decodeURIComponent(rawKey || ''),
        value: decodeURIComponent(rawVal || '')
      })
    } catch {
      params.push({
        key: rawKey,
        value: rawVal
      })
    }
  }

  return params
}

export interface JwtDecoded {
  header: any
  payload: any
  rawHeader: string
  rawPayload: string
  isExpired: boolean | null
  expFormatted: string | null
  iatFormatted: string | null
  signaturePlaceholder: string
}

export function decodeJwt(token: string): JwtDecoded {
  const parts = token.trim().split('.')
  if (parts.length < 2) {
    throw new Error('Invalid JWT: A valid token must contain at least 2 dot-separated segments.')
  }

  let headerJson = ''
  let payloadJson = ''

  try {
    headerJson = decodeBase64(parts[0], true)
  } catch {
    headerJson = atob(parts[0])
  }

  try {
    payloadJson = decodeBase64(parts[1], true)
  } catch {
    payloadJson = atob(parts[1])
  }

  const header = JSON.parse(headerJson)
  const payload = JSON.parse(payloadJson)

  let isExpired: boolean | null = null
  let expFormatted: string | null = null
  let iatFormatted: string | null = null

  if (payload.exp && typeof payload.exp === 'number') {
    const expDate = new Date(payload.exp * 1000)
    isExpired = Date.now() > expDate.getTime()
    expFormatted = `${expDate.toLocaleString()} (${isExpired ? 'Expired' : 'Valid'})`
  }

  if (payload.iat && typeof payload.iat === 'number') {
    const iatDate = new Date(payload.iat * 1000)
    iatFormatted = iatDate.toLocaleString()
  }

  return {
    header,
    payload,
    rawHeader: headerJson,
    rawPayload: payloadJson,
    isExpired,
    expFormatted,
    iatFormatted,
    signaturePlaceholder: parts[2] || ''
  }
}
