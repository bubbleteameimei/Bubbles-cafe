import tailwindcss from 'tailwindcss'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// Make autoprefixer optional to avoid hard build failures if it's not installed
let autoprefixer
try {
  // Autoprefixer is CommonJS; require works in ESM via createRequire
  autoprefixer = require('autoprefixer')
} catch {
  autoprefixer = null
}

export default {
  plugins: [
    typeof tailwindcss === 'function' ? tailwindcss() : tailwindcss,
    ...(autoprefixer ? [autoprefixer()] : []),
  ],
}
