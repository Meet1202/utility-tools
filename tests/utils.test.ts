import { describe, it, expect } from 'vitest'
import { calculateEmi, calculateGst, calculatePercentage } from '../utils/calculators'
import { countText, convertCase } from '../utils/text'
import { generatePassword, evaluatePasswordStrength, generateUuids } from '../utils/crypto'
import { validateJson, formatJson, minifyJson, encodeBase64, decodeBase64, encodeUrl, decodeUrl, parseQueryParams, decodeJwt } from '../utils/dev'

describe('Calculators Utils', () => {
  it('calculates loan EMI correctly', () => {
    // 100,000 for 12 months at 10%
    const res = calculateEmi(100000, 10, 12)
    expect(res.monthlyEmi).toBe(8792)
    expect(res.totalInterest).toBe(5499)
    expect(res.totalPayment).toBe(105499)
    expect(res.schedule.length).toBe(12)
  })

  it('calculates GST exclusive and inclusive correctly', () => {
    // Exclusive 18% on 1000
    const exclusive = calculateGst(1000, 18, false)
    expect(exclusive.netAmount).toBe(1000)
    expect(exclusive.gstAmount).toBe(180)
    expect(exclusive.grossAmount).toBe(1180)
    expect(exclusive.cgstAmount).toBe(90)
    expect(exclusive.sgstAmount).toBe(90)

    // Inclusive 18% on 1180
    const inclusive = calculateGst(1180, 18, true)
    expect(inclusive.netAmount).toBe(1000)
    expect(inclusive.gstAmount).toBe(180)
    expect(inclusive.grossAmount).toBe(1180)
  })

  it('calculates percentages correctly', () => {
    // 20% of 500 = 100
    const p1 = calculatePercentage('whatIsXPercentOfY', 20, 500)
    expect(p1.result).toBe(100)

    // 50 is what % of 200 = 25%
    const p2 = calculatePercentage('xIsWhatPercentOfY', 50, 200)
    expect(p2.result).toBe(25)

    // Increase from 100 to 150 = 50%
    const p3 = calculatePercentage('percentageChange', 100, 150)
    expect(p3.result).toBe(50)
  })
})

describe('Text Utils', () => {
  it('counts words and characters accurately', () => {
    const text = 'Hello world! This is a test paragraph with seven words.'
    const stats = countText(text)
    expect(stats.words).toBe(10)
    expect(stats.sentences).toBe(2)
    expect(stats.characters).toBe(text.length)
  })

  it('converts cases properly', () => {
    expect(convertCase('hello world', 'upper')).toBe('HELLO WORLD')
    expect(convertCase('HELLO WORLD', 'lower')).toBe('hello world')
    expect(convertCase('the lord of the rings', 'title')).toBe('The Lord of the Rings')
    expect(convertCase('hello world test', 'camel')).toBe('helloWorldTest')
    expect(convertCase('hello world test', 'pascal')).toBe('HelloWorldTest')
    expect(convertCase('hello world test', 'snake')).toBe('hello_world_test')
    expect(convertCase('hello world test', 'kebab')).toBe('hello-world-test')
    expect(convertCase('hello world test', 'constant')).toBe('HELLO_WORLD_TEST')
  })
})

describe('Crypto Utils', () => {
  it('generates passwords of requested length', () => {
    const pwd = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: false
    })
    expect(pwd.length).toBe(16)
    const strength = evaluatePasswordStrength(pwd)
    expect(strength.score).toBeGreaterThanOrEqual(75)
  })

  it('generates bulk UUIDs', () => {
    const ids = generateUuids({ count: 5, uppercase: true })
    expect(ids.length).toBe(5)
    expect(ids[0]).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/)
  })
})

describe('Developer Utils', () => {
  it('validates and formats JSON', () => {
    const validRaw = '{"b": 2, "a": 1}'
    const val = validateJson(validRaw)
    expect(val.isValid).toBe(true)

    const formatted = formatJson(validRaw, 2, true)
    expect(formatted).toBe('{\n  "a": 1,\n  "b": 2\n}')

    const minified = minifyJson(formatted)
    expect(minified).toBe('{"a":1,"b":2}')

    const invalid = validateJson('{ bad json }')
    expect(invalid.isValid).toBe(false)
  })

  it('encodes and decodes Base64 safely with UTF-8', () => {
    const original = 'Hello World! 🚀 Emojis & üñîçødé'
    const encoded = encodeBase64(original)
    const decoded = decodeBase64(encoded)
    expect(decoded).toBe(original)
  })

  it('encodes and parses URLs and Query params', () => {
    const url = 'https://example.com/search?q=nuxt%203&category=tools&sort=asc'
    const params = parseQueryParams(url)
    expect(params.length).toBe(3)
    expect(params[0]).toEqual({ key: 'q', value: 'nuxt 3' })
    expect(params[1]).toEqual({ key: 'category', value: 'tools' })
  })

  it('decodes JWT tokens correctly', () => {
    // Standard test JWT payload { sub: "1234567890", name: "John Doe", iat: 1516239022 }
    const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const decoded = decodeJwt(sampleJwt)
    expect(decoded.header.alg).toBe('HS256')
    expect(decoded.payload.name).toBe('John Doe')
    expect(decoded.payload.sub).toBe('1234567890')
  })
})
