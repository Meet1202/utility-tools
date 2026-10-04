import { describe, it, expect } from 'vitest'
import { parseRangeGroups } from '../utils/pdf'

describe('PDF Range Parser', () => {
  it('parses mixed ranges and single pages cleanly', () => {
    const res = parseRangeGroups('1-3, 5, 8-10', 12)
    expect(res.errors.length).toBe(0)
    expect(res.groups.length).toBe(3)
    expect(res.groups[0].pages).toEqual([0, 1, 2])
    expect(res.groups[1].pages).toEqual([4])
    expect(res.groups[2].pages).toEqual([7, 8, 9])
    expect(res.allIndices).toEqual([0, 1, 2, 4, 7, 8, 9])
  })

  it('handles spaces and "to" syntax', () => {
    const res = parseRangeGroups('2 to 4, 6 - 7', 10)
    expect(res.groups.length).toBe(2)
    expect(res.groups[0].pages).toEqual([1, 2, 3])
    expect(res.groups[1].pages).toEqual([5, 6])
  })

  it('handles inverted ranges (e.g. 5-3)', () => {
    const res = parseRangeGroups('5-3', 10)
    expect(res.groups.length).toBe(1)
    expect(res.groups[0].pages).toEqual([2, 3, 4])
  })

  it('reports out-of-bounds pages', () => {
    const res = parseRangeGroups('1-5, 15', 10)
    expect(res.errors.length).toBeGreaterThan(0)
    expect(res.groups[0].pages).toEqual([0, 1, 2, 3, 4])
    expect(res.groups.length).toBe(1)
  })
})
