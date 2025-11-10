#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const START_DIRS = ['src/components', 'src/pages', 'src/layouts', 'src/islands'];
const IGNORE_DIRS = ['src/i18n/messages', 'node_modules', 'dist'];
const EXTS = new Set(['.astro', '.tsx', '.ts', '.jsx', '.js']);

// Common hardcoded phrases to flag (extend as needed)
const PHRASES = [
  'Free', 'Contact', 'Message', 'About', 'Pricing', 'Team', 'Blog', 'FAQ', 'Send',
  'Latest', 'What', 'Yes', 'No', 'Tokens & Stats', 'What people say',
  'Starter', 'Pro', 'Enterprise', 'SLA & support', 'Custom integrations',
  'Advanced localization'
];
const RE = new RegExp(`\\b(${PHRASES.map((p) => p.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')).join('|')})\\b`);

function walk(dir, results = []) {
  if (IGNORE_DIRS.some((ig) => dir.includes(ig))) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, results);
    else if (EXTS.has(extname(full))) results.push(full);
  }
  return results;
}

function scanFile(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('messages.') || line.includes("t('") || line.includes('t("')) return;
    const m = line.match(RE);
    if (m) {
      const text = m[0];
      // Heuristic: ignore import lines and URLs
      if (/^\s*(import|export)\s/.test(line) || /https?:\/\//.test(line)) return;
      console.log(`${file}:${idx + 1}: HARD-CODED? -> "${text}"`);
    }
  });
}

let files = [];
for (const d of START_DIRS) {
  try { files = files.concat(walk(join(ROOT, d))); } catch {}
}
files.forEach(scanFile);


