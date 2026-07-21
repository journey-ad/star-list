#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const token = process.env.GH_TOKEN
if (!token) {
  console.error('GH_TOKEN env var is required')
  process.exit(1)
}

const resp = await fetch('https://api.github.com/emojis', {
  headers: {
    Authorization: `token ${token}`,
    'User-Agent': 'star-list-emoji-gen',
    Accept: 'application/vnd.github+json',
  },
})

if (!resp.ok) {
  console.error(`Failed to fetch emojis: HTTP ${resp.status}`)
  process.exit(1)
}

const data = await resp.json()
const out = {}

for (const [name, url] of Object.entries(data)) {
  const m = url.match(/\/([a-f0-9-]+)\.png/)
  if (m) {
    const points = m[1].split('-').map(h => parseInt(h, 16))
    out[name] = String.fromCodePoint(...points)
  }
}

const outPath = path.join(process.cwd(), 'emoji.json')
fs.writeFileSync(outPath, JSON.stringify(out))
console.log(`Wrote ${Object.keys(out).length} emojis to ${outPath}`)
