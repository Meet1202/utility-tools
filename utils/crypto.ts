export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz'
const NUMBER_CHARS = '0123456789'
const SYMBOL_CHARS = '!@#$%^&*()_+~|}{[]:;?><,./-='
const AMBIGUOUS_CHARS = new Set(['0', 'O', 'o', 'l', '1', 'I', '|', '`', '\''])

export function generatePassword(options: PasswordOptions): string {
  let charPool = ''

  if (options.uppercase) charPool += UPPERCASE_CHARS
  if (options.lowercase) charPool += LOWERCASE_CHARS
  if (options.numbers) charPool += NUMBER_CHARS
  if (options.symbols) charPool += SYMBOL_CHARS

  if (!charPool) {
    charPool = LOWERCASE_CHARS + NUMBER_CHARS
  }

  if (options.excludeAmbiguous) {
    charPool = charPool.split('').filter(c => !AMBIGUOUS_CHARS.has(c)).join('')
  }

  const length = Math.max(4, Math.min(128, options.length))
  const randomValues = new Uint32Array(length)

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
  } else {
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 0xffffffff)
    }
  }

  let result = ''
  for (let i = 0; i < length; i++) {
    result += charPool[randomValues[i] % charPool.length]
  }

  return result
}

export function evaluatePasswordStrength(password: string): {
  score: number // 0 - 100
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Unbreakable'
  color: string
} {
  if (!password) {
    return { score: 0, label: 'Very Weak', color: 'bg-rose-500' }
  }

  let score = 0
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 15
  if (password.length >= 16) score += 15
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 10
  if (/[^A-Za-z0-9]/.test(password)) score += 15

  if (score < 30) {
    return { score, label: 'Very Weak', color: 'bg-rose-500' }
  } else if (score < 50) {
    return { score, label: 'Weak', color: 'bg-amber-500' }
  } else if (score < 75) {
    return { score, label: 'Medium', color: 'bg-yellow-500' }
  } else if (score < 90) {
    return { score, label: 'Strong', color: 'bg-emerald-500' }
  } else {
    return { score: 100, label: 'Unbreakable', color: 'bg-emerald-400' }
  }
}

export interface UuidOptions {
  count: number
  uppercase?: boolean
  hyphens?: boolean
  braces?: boolean
}

export function generateUuids(options: UuidOptions): string[] {
  const count = Math.max(1, Math.min(100, options.count || 1))
  const results: string[] = []

  for (let i = 0; i < count; i++) {
    let id = ''
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID()
    } else {
      // Fallback v4 generator
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }

    if (options.hyphens === false) {
      id = id.replace(/-/g, '')
    }

    if (options.uppercase) {
      id = id.toUpperCase()
    }

    if (options.braces) {
      id = `{${id}}`
    }

    results.push(id)
  }

  return results
}
