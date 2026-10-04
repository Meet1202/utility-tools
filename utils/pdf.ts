export interface PageRangeGroup {
  label: string
  pages: number[] // 0-indexed page indices
  displayString: string
}

/**
 * Parses user range string (e.g. "1-3, 5, 8-10", "1 to 3; 5", "1 - 4")
 * into distinct groups of 0-indexed page indices.
 */
export function parseRangeGroups(input: string, maxPages: number): {
  groups: PageRangeGroup[]
  allIndices: number[]
  errors: string[]
} {
  const groups: PageRangeGroup[] = []
  const allIndicesSet = new Set<number>()
  const errors: string[] = []

  if (!input || !input.trim()) {
    return { groups: [], allIndices: [], errors: ['Please enter page numbers or ranges.'] }
  }

  // Split by comma, semicolon, or newline
  const parts = input.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean)

  for (const part of parts) {
    // Check for range like "1-3" or "1 to 3" or "1 - 3"
    const rangeMatch = part.match(/^(\d+)\s*(?:-|to)\s*(\d+)$/i)
    if (rangeMatch) {
      let start = parseInt(rangeMatch[1], 10)
      let end = parseInt(rangeMatch[2], 10)

      if (start > end) {
        // Swap if descending e.g. 5-3
        const temp = start
        start = end
        end = temp
      }

      if (start < 1) {
        errors.push(`Page number ${start} is invalid. Pages start at 1.`)
        start = 1
      }
      if (end > maxPages) {
        errors.push(`Page range ${start}-${end} exceeds document limit of ${maxPages} pages.`)
        end = maxPages
      }

      if (start <= end) {
        const pages: number[] = []
        for (let p = start; p <= end; p++) {
          pages.push(p - 1)
          allIndicesSet.add(p - 1)
        }
        groups.push({
          label: start === end ? `page_${start}` : `pages_${start}-${end}`,
          displayString: start === end ? `Page ${start}` : `Pages ${start}-${end} (${pages.length} pages)`,
          pages
        })
      }
    } else {
      // Single page number
      const numMatch = part.match(/^(\d+)$/)
      if (numMatch) {
        const p = parseInt(numMatch[1], 10)
        if (p < 1 || p > maxPages) {
          errors.push(`Page ${p} is out of bounds (document has ${maxPages} pages).`)
        } else {
          allIndicesSet.add(p - 1)
          groups.push({
            label: `page_${p}`,
            displayString: `Page ${p}`,
            pages: [p - 1]
          })
        }
      } else {
        errors.push(`Could not understand "${part}". Use formats like 1-3, 5, 8-10.`)
      }
    }
  }

  const allIndices = Array.from(allIndicesSet).sort((a, b) => a - b)
  return { groups, allIndices, errors }
}
