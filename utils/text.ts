export interface TextStats {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  readingTimeMinutes: number
  speakingTimeMinutes: number
  keywordDensity: Array<{ word: string; count: number; percent: number }>
}

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'is', 'are', 'was', 'were', 'been', 'has', 'had'
])

export function countText(text: string): TextStats {
  if (!text || !text.trim()) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      keywordDensity: []
    }
  }

  const trimmed = text.trim()
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length

  // Words matching alphanumeric chunks
  const wordTokens = trimmed.match(/\b[A-Za-z0-9'-]+\b/g) || []
  const words = wordTokens.length

  // Sentences ending in ., !, ?
  const sentenceMatches = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g)
  const sentences = sentenceMatches ? sentenceMatches.length : (words > 0 ? 1 : 0)

  // Paragraphs
  const paragraphMatches = text.split(/\n+/).filter(p => p.trim().length > 0)
  const paragraphs = paragraphMatches.length

  // Reading & Speaking times
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200))
  const speakingTimeMinutes = Math.max(1, Math.ceil(words / 130))

  // Keyword density
  const wordFrequencies: Record<string, number> = {}
  for (const token of wordTokens) {
    const clean = token.toLowerCase()
    if (clean.length > 2 && !STOP_WORDS.has(clean)) {
      wordFrequencies[clean] = (wordFrequencies[clean] || 0) + 1
    }
  }

  const keywordDensity = Object.entries(wordFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      percent: parseFloat(((count / Math.max(1, words)) * 100).toFixed(1))
    }))

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes: words === 0 ? 0 : readingTimeMinutes,
    speakingTimeMinutes: words === 0 ? 0 : speakingTimeMinutes,
    keywordDensity
  }
}

export type TextCase =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'

export function convertCase(text: string, targetCase: TextCase): string {
  if (!text) return ''

  switch (targetCase) {
    case 'upper':
      return text.toUpperCase()

    case 'lower':
      return text.toLowerCase()

    case 'title': {
      const minorWords = new Set(['and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'v', 'via'])
      return text.replace(/\b\w+/g, (word, index) => {
        const lower = word.toLowerCase()
        if (index > 0 && minorWords.has(lower)) {
          return lower
        }
        return lower.charAt(0).toUpperCase() + lower.slice(1)
      })
    }

    case 'sentence': {
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
    }

    case 'camel': {
      const words = text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
      if (words.length === 0) return ''
      return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
    }

    case 'pascal': {
      const words = text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
    }

    case 'snake': {
      return text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase()
    }

    case 'kebab': {
      return text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
    }

    case 'constant': {
      return text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toUpperCase()
    }

    default:
      return text
  }
}
