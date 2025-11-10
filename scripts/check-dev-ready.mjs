#!/usr/bin/env node

/**
 * 開發環境檢查腳本
 * 確保項目狀態良好，可以開始開發
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

console.log('🔍 檢查開發環境狀態...\n');

// 檢查基本文件
const essentialFiles = [
  'package.json',
  'src/i18n/loadMessages.ts',
  'src/i18n/messages/zh-TW/site.json',
  'src/i18n/messages/zh-TW/claim.json',
  'docs/i18n-GUIDE.md',
  'DEVELOPMENT-GUIDE.md'
];

console.log('📁 檢查核心文件...');
let missingFiles = [];
for (const file of essentialFiles) {
  if (existsSync(resolve(root, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 缺失！`);
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log(`\n🚨 發現 ${missingFiles.length} 個缺失文件，請先修復！`);
  process.exit(1);
}

// 檢查 i18n 工具
console.log('\n🛠 檢查 i18n 工具...');
try {
  execSync('pnpm scan:i18n --help', { stdio: 'pipe' });
  console.log('✅ pnpm scan:i18n');
} catch (error) {
  console.log('❌ pnpm scan:i18n - 無法運行');
}

try {
  execSync('pnpm i18n:diff', { stdio: 'pipe' });
  console.log('✅ pnpm i18n:diff');
} catch (error) {
  console.log('❌ pnpm i18n:diff - 無法運行');
}

try {
  execSync('pnpm i18n:sync', { stdio: 'pipe' });
  console.log('✅ pnpm i18n:sync');
} catch (error) {
  console.log('❌ pnpm i18n:sync - 無法運行');
}

// 檢查硬編碼
console.log('\n🔍 檢查硬編碼...');
try {
  const result = execSync('pnpm scan:i18n', { encoding: 'utf8' });
  const hardcodedCount = (result.match(/HARD-CODED/g) || []).length;
  
  if (hardcodedCount === 0) {
    console.log('✅ 無硬編碼問題');
  } else {
    console.log(`⚠️  發現 ${hardcodedCount} 個可能的硬編碼`);
    console.log('   請檢查是否為防禦性 fallback 值');
  }
} catch (error) {
  console.log('❌ 無法檢查硬編碼');
}

// 檢查版本
console.log('\n📋 檢查版本信息...');
try {
  const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  console.log(`✅ 版本：${packageJson.version}`);
} catch (error) {
  console.log('❌ 無法讀取版本信息');
}

// 檢查 Git 狀態
console.log('\n📦 檢查 Git 狀態...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim() === '') {
    console.log('✅ 工作目錄乾淨');
  } else {
    console.log('⚠️  有未提交的更改：');
    console.log(gitStatus);
  }
} catch (error) {
  console.log('❌ 無法檢查 Git 狀態');
}

// 檢查開發服務器
console.log('\n🌐 檢查開發服務器...');
try {
  const response = await fetch('http://localhost:4322/zh-TW/');
  if (response.ok) {
    console.log('✅ 開發服務器運行中 (localhost:4322)');
  } else {
    console.log('⚠️  開發服務器可能未運行');
  }
} catch (error) {
  console.log('⚠️  開發服務器未運行，請執行：pnpm dev --port 4321');
}

console.log('\n🎯 開發準備檢查完成！');
console.log('\n📚 重要提醒：');
console.log('1. 閱讀 DEVELOPMENT-GUIDE.md 了解開發規範');
console.log('2. 閱讀 docs/i18n-GUIDE.md 了解完整 i18n 規範');
console.log('3. 新功能開發：先寫 zh-TW JSON，再寫頁面代碼');
console.log('4. 提交前運行：pnpm scan:i18n && pnpm i18n:sync');
console.log('\n🚀 準備開始開發！');
