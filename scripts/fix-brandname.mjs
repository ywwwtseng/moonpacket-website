#!/usr/bin/env node

/**
 * 批量替換所有 i18n 文件中的 Moonpacket/MoonPocket 為 moonpacket
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 查找所有包含 Moonpacket/MoonPocket 的 i18n 文件...\n');

// 獲取所有需要修改的文件
const filesOutput = execSync(
  'find src/i18n/messages -name "*.json" -type f | xargs grep -l -i "moonpacket\\|moonpocket"',
  { encoding: 'utf8' }
);

const files = filesOutput.trim().split('\n').filter(Boolean);

console.log(`找到 ${files.length} 個文件需要修改\n`);

let totalReplacements = 0;
let modifiedFiles = 0;

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf8');
    let newContent = content;
    let fileReplacements = 0;
    
    // 替換所有變體
    const patterns = [
      /MoonPocket/g,
      /Moonpacket/g,
      /MOONPACKET/g,
      /moonPacket/g,
    ];
    
    for (const pattern of patterns) {
      const matches = newContent.match(pattern);
      if (matches) {
        fileReplacements += matches.length;
        newContent = newContent.replace(pattern, 'moonpacket');
      }
    }
    
    if (fileReplacements > 0) {
      writeFileSync(file, newContent, 'utf8');
      console.log(`✓ ${file}: ${fileReplacements} 處替換`);
      totalReplacements += fileReplacements;
      modifiedFiles++;
    }
  } catch (error) {
    console.error(`✗ ${file}: ${error.message}`);
  }
}

console.log(`\n✅ 完成！`);
console.log(`修改了 ${modifiedFiles} 個文件`);
console.log(`總共 ${totalReplacements} 處替換`);

