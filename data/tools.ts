export interface FaqItem {
  question: string
  answer: string
}

export interface ToolItem {
  slug: string
  name: string
  category: 'pdf' | 'image' | 'developer' | 'text' | 'calculator' | 'india' | 'generator'
  shortDescription: string
  seoTitle: string
  seoDescription: string
  keywords: string[]
  icon: string
  howToSteps: string[]
  faq: FaqItem[]
  relatedSlugs: string[]
  phase: 1 | 2 | 3
  isPopular?: boolean
  isFlagship?: boolean
}

export interface CategoryItem {
  slug: 'pdf' | 'image' | 'developer' | 'text' | 'calculator' | 'india' | 'generator'
  name: string
  description: string
  icon: string
}

export const CATEGORIES: CategoryItem[] = [
  {
    slug: 'pdf',
    name: 'PDF Tools',
    description: 'Merge, split, compress, and convert PDF documents 100% in your browser.',
    icon: 'FileText'
  },
  {
    slug: 'image',
    name: 'Image Tools',
    description: 'Compress, resize, convert, crop, and generate QR codes privately.',
    icon: 'Image'
  },
  {
    slug: 'developer',
    name: 'Developer Tools',
    description: 'Format JSON, decode JWTs, encode Base64, generate UUIDs, and debug.',
    icon: 'Code'
  },
  {
    slug: 'text',
    name: 'Text Tools',
    description: 'Count words, convert casing, sort lines, and clean up textual content.',
    icon: 'Type'
  },
  {
    slug: 'calculator',
    name: 'Calculators',
    description: 'Calculate loans, percentages, BMI, interest, and conversions instantly.',
    icon: 'Calculator'
  },
  {
    slug: 'india',
    name: 'India Finance',
    description: 'Calculate GST, tax regimes, HRA, EPF, and INR currency in words.',
    icon: 'Receipt'
  },
  {
    slug: 'generator',
    name: 'Generators',
    description: 'Generate strong passwords, random numbers, invoices, and timers.',
    icon: 'Sparkles'
  }
]

export const TOOLS: ToolItem[] = [
  // --- PDF TOOLS ---
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    category: 'pdf',
    shortDescription: 'Combine multiple PDF files into one clean document with drag-and-drop reordering.',
    seoTitle: 'Merge PDF Online Free - Combine PDF Files in Browser',
    seoDescription: 'Merge PDF files online privately in your browser. Reorder pages, combine multiple documents into one single PDF without uploading to a server.',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger', 'pdf joiner free'],
    icon: 'Files',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['split-pdf', 'compress-pdf', 'image-to-pdf'],
    howToSteps: [
      'Drop or select two or more PDF files from your device.',
      'Drag cards to reorder files in the sequence you desire.',
      'Review total page counts and delete any unwanted files.',
      'Click "Merge PDFs" to combine them securely in your browser and download.'
    ],
    faq: [
      {
        question: 'Are my PDF files uploaded to your server?',
        answer: 'No. The entire merging process happens directly on your device using client-side WebAssembly and JavaScript (pdf-lib). Your files never leave your computer or phone.'
      },
      {
        question: 'Is there a file size or page count limit?',
        answer: 'There are no artificial limits. You can merge as many files as your device’s available browser memory allows.'
      },
      {
        question: 'Can I reorder files before merging?',
        answer: 'Yes! You can use the drag handles or the move up/down buttons on each file card to set the exact order you want.'
      }
    ]
  },
  {
    slug: 'split-pdf',
    name: 'Split PDF',
    category: 'pdf',
    shortDescription: 'Extract specific page ranges or split every page into separate PDF files.',
    seoTitle: 'Split PDF Online Free - Separate PDF Pages in Browser',
    seoDescription: 'Split PDF files by custom page ranges (e.g. 1-3, 5, 8-10) or extract every page into individual PDFs. 100% private and client-side.',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf', 'cut pdf pages online'],
    icon: 'Scissors',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['merge-pdf', 'compress-pdf', 'pdf-to-image'],
    howToSteps: [
      'Upload the PDF file you want to split.',
      'Choose your split mode: custom page ranges (e.g., 1-3, 5) or extract each page.',
      'Preview total page count and verify your selection.',
      'Click "Split PDF" to generate and download individual files or a neat ZIP archive.'
    ],
    faq: [
      {
        question: 'How do I specify multiple page ranges?',
        answer: 'Enter comma-separated values like "1-3, 5, 7-10". The tool extracts exactly those pages into a new combined PDF or individual files.'
      },
      {
        question: 'Does splitting reduce the document quality?',
        answer: 'Not at all. Vector graphics, fonts, and images are preserved exactly as original with lossless stream extraction.'
      },
      {
        question: 'Is it safe to split sensitive documents like bank statements?',
        answer: 'Absolutely. Because everything runs purely in your browser, no external server or third party ever receives your data.'
      }
    ]
  },
  {
    slug: 'compress-pdf',
    name: 'Compress PDF',
    category: 'pdf',
    shortDescription: 'Reduce PDF file size in your browser with lossless stream optimization or rasterization.',
    seoTitle: 'Compress PDF Online - Reduce PDF File Size Privately',
    seoDescription: 'Compress PDF files online without losing quality. Choose between metadata stripping stream compression or strong rasterization modes.',
    keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf compressor online free'],
    icon: 'Minimize2',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['merge-pdf', 'split-pdf', 'image-to-pdf'],
    howToSteps: [
      'Select a PDF file to compress.',
      'Choose between "Basic Compression" (strips unused objects and metadata) or "Strong Compression".',
      'Click "Compress PDF" and monitor the real-time progress.',
      'Compare original vs compressed size and download the optimized PDF.'
    ],
    faq: [
      {
        question: 'What is the difference between Basic and Strong compression?',
        answer: 'Basic mode rewrites internal PDF object streams and strips unnecessary metadata while preserving 100% vector text. Strong mode optimizes image objects to minimize size.'
      },
      {
        question: 'Will the text still be selectable?',
        answer: 'In Basic compression mode, all text remains crisp, selectable, and searchable.'
      },
      {
        question: 'How much size reduction can I expect?',
        answer: 'Typical PDFs with embedded metadata, uncompressed streams, or redundant forms see 20% to 70% reduction.'
      }
    ]
  },
  {
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    category: 'pdf',
    shortDescription: 'Convert JPG, PNG, and WebP images into a single professional PDF document.',
    seoTitle: 'Image to PDF Converter - Convert JPG & PNG to PDF Online',
    seoDescription: 'Convert images (JPG, PNG, WebP) to PDF online for free. Adjust margins, page orientation (Portrait/Landscape), and page size (A4, Letter, Fit).',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert photos to pdf', 'picture to pdf'],
    icon: 'FileImage',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['pdf-to-image', 'merge-pdf', 'image-resizer'],
    howToSteps: [
      'Select or drag and drop one or more images (JPG, PNG, WebP).',
      'Reorder images by dragging or using the position buttons.',
      'Customize page size (A4, US Letter, or Fit to Image), orientation, and margins.',
      'Click "Generate PDF" to compile and download your document immediately.'
    ],
    faq: [
      {
        question: 'Can I combine multiple pictures into one PDF?',
        answer: 'Yes! You can upload dozens of photos and arrange them in any sequence to produce a single consolidated PDF.'
      },
      {
        question: 'What formats are supported?',
        answer: 'Standard image formats including JPEG, PNG, and modern WebP are supported directly.'
      },
      {
        question: 'Can I set custom margins or page orientation?',
        answer: 'Yes, you can choose Portrait or Landscape, A4 or Letter, and Small, Normal, or Zero margin presets.'
      }
    ]
  },
  {
    slug: 'pdf-to-image',
    name: 'PDF to Image',
    category: 'pdf',
    shortDescription: 'Convert PDF pages into high-resolution PNG or JPG images with custom scale.',
    seoTitle: 'PDF to Image Converter Online - Convert PDF to PNG / JPG',
    seoDescription: 'Convert PDF pages into crisp JPG or PNG images directly in your browser. Choose DPI resolution, select pages, and download as single images or a ZIP.',
    keywords: ['pdf to image', 'pdf to png', 'pdf to jpg', 'export pdf pages as pictures'],
    icon: 'ImageDown',
    phase: 1,
    isPopular: false,
    relatedSlugs: ['image-to-pdf', 'split-pdf', 'compress-pdf'],
    howToSteps: [
      'Choose the PDF document you want to extract images from.',
      'Select your output image format (PNG for lossless clarity, JPG for smaller sizes).',
      'Pick resolution scale (1x, 1.5x, 2x for ultra HD).',
      'Download individual pages or click "Download All (ZIP)".'
    ],
    faq: [
      {
        question: 'What image quality should I select?',
        answer: 'Use 2x scale and PNG format for presentation slides or text documents, or JPG at 1.5x for general sharing and compact file sizes.'
      },
      {
        question: 'Can I choose specific pages?',
        answer: 'Yes, you can preview all rendered pages and download only the specific pages you need.'
      },
      {
        question: 'Are high-resolution outputs supported?',
        answer: 'Yes, rendering happens on HTML5 Canvas with up to 300+ DPI equivalent scaling.'
      }
    ]
  },

  // --- IMAGE TOOLS ---
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    category: 'image',
    shortDescription: 'Compress JPG, PNG, and WebP images with live before/after size and visual comparison.',
    seoTitle: 'Image Compressor Online - Compress JPG, PNG, WebP Free',
    seoDescription: 'Compress images online with adjustable quality slider. Batch compress multiple photos directly in your browser with real-time file size savings.',
    keywords: ['image compressor', 'compress jpg', 'compress png', 'reduce image file size', 'photo compressor'],
    icon: 'Shrink',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['image-resizer', 'image-converter', 'image-to-pdf'],
    howToSteps: [
      'Upload one or more JPG, PNG, or WebP images.',
      'Adjust the quality slider to find your optimal balance between size and clarity.',
      'Inspect before and after file sizes and percentage saved.',
      'Download your optimized images individually or as a single batch.'
    ],
    faq: [
      {
        question: 'How does in-browser image compression work?',
        answer: 'We utilize the browser’s native Canvas API and offscreen rendering contexts to resample and quantize image bytes with hardware acceleration.'
      },
      {
        question: 'Does this tool strip GPS and camera metadata?',
        answer: 'Yes! Re-encoding through Canvas automatically strips EXIF data and private location tags, boosting privacy.'
      },
      {
        question: 'Can I compress multiple images at once?',
        answer: 'Yes, batch compression is fully supported with individual before/after statistics.'
      }
    ]
  },
  {
    slug: 'image-resizer',
    name: 'Image Resizer',
    category: 'image',
    shortDescription: 'Resize photos by exact pixels or percentage while maintaining aspect ratio.',
    seoTitle: 'Image Resizer Online - Resize Photos by Width, Height, %',
    seoDescription: 'Easily resize images online for social media, avatars, or web optimization. Maintain aspect ratio, choose percentage or pixel dimensions.',
    keywords: ['image resizer', 'resize picture online', 'resize photo pixels', 'scale image free'],
    icon: 'Scaling',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['image-compressor', 'image-converter', 'image-to-pdf'],
    howToSteps: [
      'Upload the image you want to resize.',
      'Choose to resize by exact Dimensions (pixels) or Percentage.',
      'Keep "Lock Aspect Ratio" checked to avoid distortion.',
      'Click "Resize Image" and download your scaled picture.'
    ],
    faq: [
      {
        question: 'Will resizing distort my photo?',
        answer: 'With the aspect ratio lock enabled, altering width automatically recalculates height proportionately, preventing stretching.'
      },
      {
        question: 'Are there social media presets?',
        answer: 'Yes, quick preset buttons are available for Instagram square (1080x1080), YouTube thumbnail (1280x720), and Twitter banners.'
      },
      {
        question: 'What formats can I save to?',
        answer: 'You can export as PNG, JPEG, or WebP.'
      }
    ]
  },
  {
    slug: 'image-converter',
    name: 'Image Format Converter',
    category: 'image',
    shortDescription: 'Convert images between JPG, PNG, and WebP instantly with zero uploads.',
    seoTitle: 'Image Format Converter - Convert JPG, PNG, WebP Online',
    seoDescription: 'Convert image formats online for free. Switch seamlessly between PNG, JPG, and WebP with custom quality controls and instant download.',
    keywords: ['image converter', 'png to jpg', 'jpg to png', 'webp converter', 'convert image format'],
    icon: 'RefreshCw',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['image-compressor', 'image-resizer', 'image-to-pdf'],
    howToSteps: [
      'Select or drag files in any common format (JPG, PNG, WebP).',
      'Choose your desired target format: PNG, JPG, or WebP.',
      'Adjust quality if converting to a lossy format (JPG/WebP).',
      'Download converted files individually or together.'
    ],
    faq: [
      {
        question: 'Which format should I choose?',
        answer: 'Use PNG if you need transparent backgrounds. Use JPG for general photographs, and WebP for lightweight modern websites.'
      },
      {
        question: 'Can WebP images be viewed in all browsers?',
        answer: 'Yes! All modern browsers (Chrome, Safari, Firefox, Edge) have full WebP support.'
      },
      {
        question: 'Is my image data kept confidential?',
        answer: 'Completely. Images are read via FileReader API and drawn on HTML5 canvas in your local browser sandbox.'
      }
    ]
  },
  {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    category: 'image',
    shortDescription: 'Create custom QR codes for URLs, Wi-Fi, UPI payments, vCards, WhatsApp, and text with custom colors and logo.',
    seoTitle: 'Custom QR Code Generator - Free High-Res QR with Logo & UPI',
    seoDescription: 'Generate customized QR codes for URLs, Wi-Fi credentials, India UPI payments, vCard contacts, WhatsApp, and email. Add center logos, custom dot styles, and download in PNG or SVG.',
    keywords: ['qr code generator', 'upi qr code generator', 'wifi qr code', 'custom qr code with logo', 'free qr maker'],
    icon: 'QrCode',
    phase: 1,
    isPopular: true,
    isFlagship: true,
    relatedSlugs: ['image-compressor', 'url-encoder-decoder', 'base64-converter'],
    howToSteps: [
      'Select your QR code type (URL, Plain Text, UPI Payment, Wi-Fi, vCard, WhatsApp, Email, or Phone).',
      'Fill in the specific details (e.g. Wi-Fi SSID & password, UPI VPA & payee name).',
      'Customize foreground & background colors, dot shape, and error correction level.',
      'Optionally upload a center logo or icon.',
      'Download your high-resolution QR code in PNG or crisp vector SVG format.'
    ],
    faq: [
      {
        question: 'How do UPI Payment QR codes work?',
        answer: 'They encode the standard NPCI UPI URI scheme (upi://pay?pa=...&pn=...&am=...). When scanned by Google Pay, PhonePe, Paytm, or BHIM, it directly opens the payment screen with prefilled details.'
      },
      {
        question: 'Do generated QR codes ever expire?',
        answer: 'Never! These are static QR codes containing literal data, meaning they will work forever without relying on external redirect servers.'
      },
      {
        question: 'Why should I choose higher Error Correction (Level H)?',
        answer: 'High error correction allows up to 30% of the QR code to be obscured or covered by a custom center logo while remaining completely scannable.'
      },
      {
        question: 'Can I download vector SVG format for printing?',
        answer: 'Yes! Vector SVG files can be scaled to any billboard or banner size without pixelation.'
      }
    ]
  },

  // --- DEVELOPER TOOLS ---
  {
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    category: 'developer',
    shortDescription: 'Beautify, minify, validate, and inspect JSON with syntax highlighting and clear error markers.',
    seoTitle: 'JSON Formatter & Validator Online - Beautify and Fix JSON',
    seoDescription: 'Format, beautify, and validate JSON online. Collapsible view, key sorting, minify mode, syntax highlighting, and exact line/column syntax error indicators.',
    keywords: ['json formatter', 'json validator', 'beautify json', 'json pretty print', 'json minify'],
    icon: 'Braces',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['base64-converter', 'jwt-decoder', 'url-encoder-decoder'],
    howToSteps: [
      'Paste your raw JSON into the input editor or load sample data.',
      'Click "Format (2 Spaces)" or "Format (4 Spaces)" to beautify.',
      'Click "Minify" to strip whitespace for compact network payloads.',
      'Click "Sort Keys" for alphabetical key ordering, or copy with one click.'
    ],
    faq: [
      {
        question: 'What happens if my JSON has syntax errors?',
        answer: 'The parser highlights the exact character, line, and column where the syntax error occurred with an explanatory message.'
      },
      {
        question: 'Is my proprietary JSON sent to any server?',
        answer: 'Never. The parser runs purely in your local browser JavaScript engine.'
      },
      {
        question: 'Can it handle large JSON payloads?',
        answer: 'Yes, it smoothly handles megabytes of JSON text without lag.'
      }
    ]
  },
  {
    slug: 'base64-converter',
    name: 'Base64 Encode / Decode',
    category: 'developer',
    shortDescription: 'Encode and decode plain text or binary files to Base64 with full UTF-8 and URL-safe support.',
    seoTitle: 'Base64 Encode and Decode Online - UTF-8 and File Support',
    seoDescription: 'Encode text or files into Base64 format and decode Base64 strings back to original content. UTF-8 compliant, URL-safe option, and one-click copy.',
    keywords: ['base64 encode', 'base64 decode', 'base64 converter', 'base64 string to text', 'base64 file decoder'],
    icon: 'Binary',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['url-encoder-decoder', 'jwt-decoder', 'json-formatter'],
    howToSteps: [
      'Choose "Text" or "File" tab and select "Encode" or "Decode" mode.',
      'Enter your text or upload a file.',
      'Toggle URL-safe Base64 mode if needed (- and _ instead of + and /).',
      'Copy the output or download the decoded file.'
    ],
    faq: [
      {
        question: 'Is UTF-8 unicode (emojis, accents) supported properly?',
        answer: 'Yes! Standard window.btoa fails on unicode characters, but our converter handles full UTF-8 byte conversions seamlessly.'
      },
      {
        question: 'What is URL-safe Base64?',
        answer: 'Standard Base64 uses + and / which have special meanings in URL query strings. URL-safe Base64 replaces them with - and _.'
      },
      {
        question: 'Can I decode Base64 images and download them?',
        answer: 'Yes, file mode allows encoding any file to a Base64 Data URI or decoding a Base64 string back into a downloadable binary file.'
      }
    ]
  },
  {
    slug: 'url-encoder-decoder',
    name: 'URL Encode / Decode',
    category: 'developer',
    shortDescription: 'Encode or decode query parameters and URLs with an interactive query parameter table parser.',
    seoTitle: 'URL Encode & Decode Online - Parse Query Parameters',
    seoDescription: 'URL encode or decode strings and query strings. Interactive breakdown of query parameters into an editable table with one-click copy.',
    keywords: ['url encode', 'url decode', 'url encoder decoder', 'percent encoding', 'parse url query parameters'],
    icon: 'Link',
    phase: 1,
    isPopular: false,
    relatedSlugs: ['base64-converter', 'jwt-decoder', 'json-formatter'],
    howToSteps: [
      'Paste your full URL or component string into the input area.',
      'Choose "Encode" for percent-encoding or "Decode" to restore readable characters.',
      'Switch to the "Parse Query Params" tab to view every key-value pair in a clean table.',
      'Copy the encoded URL or individual parameter values.'
    ],
    faq: [
      {
        question: 'What is the difference between encodeURI and encodeURIComponent?',
        answer: 'encodeURI encodes characters that are not allowed in URIs while preserving structure (like http:// and ?). encodeURIComponent also encodes delimiters like &, =, and / so they can be safely passed inside query values.'
      },
      {
        question: 'Can this tool parse UTM tracking parameters?',
        answer: 'Yes, the query parameter inspector automatically extracts utm_source, utm_medium, and all custom GET parameters into an easy-to-read table.'
      }
    ]
  },
  {
    slug: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'developer',
    shortDescription: 'Decode JSON Web Tokens (JWT) into human-readable Header, Payload, and expiration status.',
    seoTitle: 'JWT Decoder Online - Inspect JWT Claims and Expiration Free',
    seoDescription: 'Decode JSON Web Tokens (JWT) safely in your browser. Inspect header algorithm, payload claims, issuer, subject, and humanized expiration time.',
    keywords: ['jwt decoder', 'decode jwt token', 'jwt inspector', 'jwt claims viewer', 'json web token decode'],
    icon: 'KeyRound',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['json-formatter', 'base64-converter', 'url-encoder-decoder'],
    howToSteps: [
      'Paste your bearer token or raw JWT string (three dot-separated segments).',
      'The tool instantly splits and decodes the Header and Payload.',
      'Inspect standard claims like "exp" (expiration), "iat" (issued at), and "sub".',
      'Verify whether the token is currently active or expired.'
    ],
    faq: [
      {
        question: 'Is it safe to paste production JWTs here?',
        answer: 'Yes! The entire decoding logic runs 100% locally in your browser. No tokens are sent over the network, logged, or stored.'
      },
      {
        question: 'Does this tool verify the cryptographic signature?',
        answer: 'No. Signature verification requires knowing your secret key or public certificate, which should never be pasted into a public browser tab.'
      },
      {
        question: 'How is the token expiration calculated?',
        answer: 'We parse the standard Unix timestamp in the "exp" payload claim and display the exact date, time, and relative countdown (e.g., "Expired 2 hours ago").'
      }
    ]
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    category: 'developer',
    shortDescription: 'Generate cryptographically secure v4 UUIDs in bulk with format and casing options.',
    seoTitle: 'UUID Generator Online - Generate Bulk v4 UUIDs / GUIDs',
    seoDescription: 'Generate random UUID v4 and GUIDs online using cryptographic randomness. Bulk generate up to 500 UUIDs with uppercase, hyphens, or braces options.',
    keywords: ['uuid generator', 'guid generator', 'random uuid', 'bulk uuid generator', 'uuid v4 online'],
    icon: 'Fingerprint',
    phase: 1,
    isPopular: false,
    relatedSlugs: ['password-generator', 'base64-converter', 'json-formatter'],
    howToSteps: [
      'Select how many UUIDs you want to generate (from 1 to 100).',
      'Toggle formatting options: Hyphens, Uppercase, or Braces {}.',
      'Click "Generate UUIDs" for instant cryptographically secure results.',
      'Copy individual UUIDs or download the whole list as a text file.'
    ],
    faq: [
      {
        question: 'Are the generated UUIDs truly random?',
        answer: 'Yes. They use the browser’s native crypto.randomUUID() and crypto.getRandomValues() which are cryptographically secure pseudorandom number generators (CSPRNG).'
      },
      {
        question: 'What is the probability of a UUID collision?',
        answer: 'The chance of generating two identical UUID v4 values is less than one in a billion billion, making them universally unique for all practical purposes.'
      },
      {
        question: 'Can I generate GUID format for Windows/C# applications?',
        answer: 'Yes, just enable the Uppercase and Braces options to get {XXXXXXXX-XXXX-4XXX-YXXX-XXXXXXXXXXXX}.'
      }
    ]
  },

  // --- TEXT TOOLS ---
  {
    slug: 'word-counter',
    name: 'Word & Character Counter',
    category: 'text',
    shortDescription: 'Count words, characters, sentences, paragraphs, reading time, and keyword density in real time.',
    seoTitle: 'Word Counter & Character Counter Online - Free Text Statistics',
    seoDescription: 'Free real-time word counter and character counter. Analyze sentence count, reading time, speaking time, and top keyword density as you type.',
    keywords: ['word counter', 'character counter', 'count words online', 'reading time calculator', 'keyword density tool'],
    icon: 'FileSpreadsheet',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['case-converter', 'json-formatter', 'uuid-generator'],
    howToSteps: [
      'Type or paste your text into the editor.',
      'View live statistics including words, characters (with and without spaces), sentences, and paragraphs.',
      'Check estimated reading and speaking times.',
      'Review the keyword frequency table to identify repeated words.'
    ],
    faq: [
      {
        question: 'How is reading time calculated?',
        answer: 'Reading time is computed using the industry standard average reading speed of 200 words per minute (WPM), and speaking time at 130 WPM.'
      },
      {
        question: 'Does the counter ignore extra spaces?',
        answer: 'Yes, words are detected using regex word-boundary parsing, so multiple consecutive spaces do not artificially inflate word count.'
      },
      {
        question: 'Can I copy the analyzed text or statistics?',
        answer: 'Yes, one-click copy buttons are provided for both the text and a summarized report.'
      }
    ]
  },
  {
    slug: 'case-converter',
    name: 'Case Converter',
    category: 'text',
    shortDescription: 'Transform text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case.',
    seoTitle: 'Case Converter Online - UPPERCASE, lowercase, Title Case, camelCase',
    seoDescription: 'Convert text case instantly online. Convert between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case.',
    keywords: ['case converter', 'convert to uppercase', 'title case converter', 'camelcase converter', 'snake case to kebab case'],
    icon: 'CaseUpper',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['word-counter', 'json-formatter', 'url-encoder-decoder'],
    howToSteps: [
      'Paste your text into the input field.',
      'Click on any conversion button (UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, etc.).',
      'The converted text updates instantly.',
      'Click "Copy Result" to copy to your clipboard.'
    ],
    faq: [
      {
        question: 'Does Title Case handle small words like "in", "and", "the"?',
        answer: 'Yes! Our smart Title Case algorithm follows standard English capitalization rules and keeps minor prepositions and conjunctions lowercase unless they are the first word.'
      },
      {
        question: 'Can I convert code identifiers between camelCase and snake_case?',
        answer: 'Yes! Programming cases (camelCase, PascalCase, snake_case, kebab_case, CONSTANT_CASE) are built specifically for developers.'
      }
    ]
  },

  // --- GENERATORS ---
  {
    slug: 'password-generator',
    name: 'Password Generator',
    category: 'generator',
    shortDescription: 'Generate strong, cryptographically secure passwords and passphrases with a live strength meter.',
    seoTitle: 'Strong Password Generator Online - Cryptographically Secure',
    seoDescription: 'Generate strong, unbreakable passwords online. Customize length, uppercase, numbers, symbols, avoid ambiguous characters, and test password strength.',
    keywords: ['password generator', 'strong password maker', 'random password generator', 'secure password generator free'],
    icon: 'Lock',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['uuid-generator', 'base64-converter', 'jwt-decoder'],
    howToSteps: [
      'Adjust password length (e.g. 16 to 32 characters for maximum safety).',
      'Toggle inclusion of Uppercase, Lowercase, Numbers, and Symbols.',
      'Optionally enable "Exclude Ambiguous Characters" (like 0, O, l, 1, I).',
      'Click "Generate Password" and copy it to your clipboard with one click.'
    ],
    faq: [
      {
        question: 'How are passwords generated?',
        answer: 'We use window.crypto.getRandomValues, which pulls true entropy from your operating system’s cryptographic random engine.'
      },
      {
        question: 'Are generated passwords saved anywhere?',
        answer: 'No. Generated passwords exist only in active browser memory and disappear the moment you navigate away or refresh the page.'
      },
      {
        question: 'What is considered a strong password?',
        answer: 'A password with 16+ characters combining uppercase, lowercase, numbers, and symbols takes billions of years to brute-force with modern hardware.'
      }
    ]
  },

  // --- CALCULATORS ---
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    category: 'calculator',
    shortDescription: 'Calculate percentages, % increase/decrease, X is what % of Y, and find original values effortlessly.',
    seoTitle: 'Percentage Calculator Online - Free Fast % Calculations',
    seoDescription: 'Solve any percentage problem: What is X% of Y? X is what percentage of Y? Percentage increase, decrease, and discount calculations with step-by-step formulas.',
    keywords: ['percentage calculator', 'calculate percentage', 'percent change calculator', 'percentage increase decrease'],
    icon: 'Percent',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['emi-calculator', 'gst-calculator', 'word-counter'],
    howToSteps: [
      'Select the percentage formula type (e.g. What is X% of Y, Percentage Change, or X is what % of Y).',
      'Input the corresponding numbers into the fields.',
      'The result and mathematical step-by-step formula appear in real time.',
      'Copy the answer or run another calculation.'
    ],
    faq: [
      {
        question: 'How do you calculate percentage increase?',
        answer: 'Subtract the old value from the new value, divide by the absolute old value, and multiply by 100: ((New - Old) / Old) * 100.'
      },
      {
        question: 'Can it compute negative percentage changes (decreases)?',
        answer: 'Yes, negative values represent a percentage decrease and are clearly highlighted.'
      }
    ]
  },
  {
    slug: 'emi-calculator',
    name: 'EMI / Loan Calculator',
    category: 'calculator',
    shortDescription: 'Calculate monthly loan EMI, total interest, and view an interactive amortization breakdown.',
    seoTitle: 'EMI Calculator Online - Home, Car, & Personal Loan EMI',
    seoDescription: 'Calculate Equated Monthly Installment (EMI) for home, car, or personal loans. View total interest payable, principal vs interest chart, and monthly amortization table.',
    keywords: ['emi calculator', 'loan emi calculator', 'home loan emi calculator', 'car loan calculator', 'amortization schedule'],
    icon: 'Landmark',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['gst-calculator', 'percentage-calculator', 'password-generator'],
    howToSteps: [
      'Enter Loan Principal Amount.',
      'Enter Annual Interest Rate (%).',
      'Select Tenure in Years or Months.',
      'Review your Monthly EMI, Total Interest Payable, and interactive payment ratio.'
    ],
    faq: [
      {
        question: 'What is the formula used for EMI calculation?',
        answer: 'EMI = [P x R x (1+R)^N] / [(1+R)^N - 1], where P is Principal, R is monthly interest rate, and N is the total number of monthly installments.'
      },
      {
        question: 'Does this calculator work for all banks?',
        answer: 'Yes, the reducing-balance EMI formula is standard across all international and domestic commercial banks.'
      }
    ]
  },

  // --- INDIA FINANCE ---
  {
    slug: 'gst-calculator',
    name: 'GST Calculator',
    category: 'india',
    shortDescription: 'Calculate Goods & Services Tax (GST) with preset slabs (5%, 12%, 18%, 28%) and CGST/SGST/IGST breakdown.',
    seoTitle: 'GST Calculator India - Add or Remove GST (CGST, SGST, IGST)',
    seoDescription: 'Calculate GST online for India. Easily add GST or remove GST from gross amounts. Instant breakdown of CGST, SGST, IGST, and net/gross totals.',
    keywords: ['gst calculator', 'gst calculator india', 'add gst remove gst', 'cgst sgst calculator', '18 gst calculator'],
    icon: 'Receipt',
    phase: 1,
    isPopular: true,
    relatedSlugs: ['emi-calculator', 'percentage-calculator', 'invoice-generator'],
    howToSteps: [
      'Enter the base or gross amount in INR (₹).',
      'Select the GST rate slab (0%, 5%, 12%, 18%, 28% or enter custom %).',
      'Choose "Add GST" (Net to Gross) or "Remove GST" (Gross to Net).',
      'View the complete tax breakdown including CGST, SGST, and Total Tax Amount.'
    ],
    faq: [
      {
        question: 'How is CGST and SGST split calculated for intra-state transactions?',
        answer: 'For transactions within the same state, GST is divided equally: half goes to Central GST (CGST) and half to State GST (SGST).'
      },
      {
        question: 'When should IGST be applied instead of CGST/SGST?',
        answer: 'Integrated GST (IGST) applies to inter-state sales (between two different states or union territories) and covers the full tax rate.'
      },
      {
        question: 'How do I remove GST from a total bill amount?',
        answer: 'Select "Remove GST". The formula used is: Base Amount = Total Bill / (1 + GST Rate / 100), and GST Amount = Total Bill - Base Amount.'
      }
    ]
  }
]

export function getToolBySlug(slug: string): ToolItem | undefined {
  return TOOLS.find(t => t.slug === slug)
}

export function getToolsByCategory(category: string): ToolItem[] {
  return TOOLS.filter(t => t.category === category)
}

export function getPopularTools(): ToolItem[] {
  return TOOLS.filter(t => t.isPopular)
}

export function searchTools(query: string): ToolItem[] {
  if (!query.trim()) return TOOLS
  const q = query.toLowerCase().trim()
  return TOOLS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.shortDescription.toLowerCase().includes(q) ||
    t.keywords.some(k => k.toLowerCase().includes(q)) ||
    t.category.toLowerCase().includes(q)
  )
}
