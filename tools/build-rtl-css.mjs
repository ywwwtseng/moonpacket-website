#!/usr/bin/env node
// tools/build-rtl-css.mjs

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import rtlcss from "rtlcss";

const SRC_FILES = [
  'src/styles.css',
  'src/styles/theme.css',
  'src/styles/typography.css'
];

const OUT_SRC = resolve("src/styles.rtl.css");
const OUT_PUBLIC = resolve("public/styles.rtl.css");

console.log(`[rtlcss] Processing ${SRC_FILES.length} files...`);

try {
  let combinedCSS = '';
  
  for (const srcFile of SRC_FILES) {
    const srcPath = resolve(srcFile);
    console.log(`  - Reading: ${srcPath}`);
    const css = readFileSync(srcPath, "utf8");
    combinedCSS += `/* Source: ${srcFile} */\n${css}\n\n`;
  }
  
  // Process combined CSS with rtlcss
  let result = rtlcss.process(combinedCSS, {
    clean: true,
  });
  
  // Fix direction reversal - rtlcss incorrectly flips direction:rtl to direction:ltr
  result = result.replace(/\[\s*dir\s*=\s*['"']rtl['"']\s*\]\s*\{[^}]*direction:\s*ltr[^}]*\}/g, match => {
    return match.replace(/direction:\s*ltr/, 'direction: rtl');
  });
  
  // Fix nav direction
  result = result.replace(/\[\s*dir\s*=\s*['"']rtl['"']\s*\]\s*nav\s*\{[^}]*direction:\s*ltr[^}]*\}/g, match => {
    return match.replace(/direction:\s*ltr/, 'direction: rtl');
  });
  
  // Write to both src and public for dev/prod compatibility
  mkdirSync(dirname(OUT_SRC), { recursive: true });
  mkdirSync(dirname(OUT_PUBLIC), { recursive: true });
  writeFileSync(OUT_SRC, result);
  writeFileSync(OUT_PUBLIC, result);
  
  console.log(`[rtlcss] Generated: ${OUT_SRC}`);
  console.log(`[rtlcss] Generated: ${OUT_PUBLIC}`);
  console.log(`[rtlcss] Size: ${result.length} bytes`);
} catch (error) {
  console.error(`[rtlcss] Error:`, error.message);
  process.exit(1);
}
