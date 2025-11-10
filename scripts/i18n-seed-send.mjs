import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const messagesDir = path.join(ROOT, 'src/i18n/messages');
const baseLocale = 'en-US';
const excludeLocales = new Set(['en-US', 'en-GB', 'zh-TW', 'zh-CN']);

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

function writeJson(filePath, obj) {
  const json = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(filePath, json, 'utf8');
}

function main() {
  const basePath = path.join(messagesDir, baseLocale, 'send.json');
  const base = readJson(basePath);
  if (!base) {
    console.error('[seed] Missing base file:', basePath);
    process.exit(1);
  }
  const baseFaq = base.faq || {};
  const locales = fs.readdirSync(messagesDir).filter((name) => fs.statSync(path.join(messagesDir, name)).isDirectory());

  let updated = 0;
  for (const locale of locales) {
    if (excludeLocales.has(locale)) continue;
    const targetPath = path.join(messagesDir, locale, 'send.json');
    const target = readJson(targetPath) || {};

    // Preserve existing hero if any; otherwise, fallback to base.hero
    const next = {
      title: base.title,
      hero: target.hero || base.hero || {},
      faq: {
        section_1: baseFaq.section_1,
        q1: baseFaq.q1,
        a1: baseFaq.a1,
        q2: baseFaq.q2,
        a2: baseFaq.a2,
        section_2: baseFaq.section_2,
        q3: baseFaq.q3,
        a3: baseFaq.a3,
        tip: baseFaq.tip,
        section_3: baseFaq.section_3 || 'Technical'
      }
    };

    writeJson(targetPath, next);
    updated++;
  }
  console.log(`[seed] Seeded send.json to ${updated} locales from ${baseLocale}`);
}

main();






































