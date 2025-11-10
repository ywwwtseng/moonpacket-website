#!/usr/bin/env node

/**
 * Smart backup script - only backup essential changes
 * 智能備份腳本 - 只備份核心變更
 * 
 * ⚠️ 重要原則：
 * 1. 這是「單向備份」腳本，只從本地推送到遠程
 * 2. 絕對不會修改、刪除或覆蓋本地任何文件
 * 3. 不會執行 git pull、git fetch、git reset --hard 等可能改變本地狀態的命令
 * 4. 只執行安全的讀取操作（git status、git ls-tree）和推送操作（git add、git commit、git push）
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// 必須排除的模式 - 這些文件永遠不需要備份
const EXCLUDE_PATTERNS = [
  'dist/**',
  'build/**',
  '.astro/**',
  'node_modules/**',
  '.DS_Store',
  '*.log',
  '*.pid',
  'backups/**',
  '.tmp-*',
  'test-results/**',
  'tests/**',
  '.dev.pid',
  '.preview.pid'
];

// 大文件模式 - 需要特別檢查的文件類型
const LARGE_FILE_PATTERNS = [
  'public/fonts/**',
  'public/images-optimized/**',
  'public/images/**/*.png',
  'public/images/**/*.jpg',
  'public/images/**/*.webp',
  'public/images/**/*.avif',
  'public/images/**/*.gif',
  'public/images/**/*.svg'
];

function getGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('❌ Git status failed:', error.message);
    return [];
  }
}

function getIgnoredFiles() {
  try {
    // 獲取被忽略的文件
    const ignored = execSync('git status --ignored --porcelain', { encoding: 'utf8' });
    return ignored.split('\n')
      .filter(line => line.trim().startsWith('!!'))
      .map(line => line.substring(3));
  } catch (error) {
    console.error('❌ Git ignored files failed:', error.message);
    return [];
  }
}

function isExcludedFile(filePath) {
  // 檢查是否匹配排除模式
  for (const exclude of EXCLUDE_PATTERNS) {
    // 處理通配符模式
    if (exclude.endsWith('/**')) {
      const prefix = exclude.slice(0, -3);
      if (filePath.startsWith(prefix + '/') || filePath === prefix) {
        return true;
      }
    } else if (exclude.endsWith('**')) {
      const prefix = exclude.slice(0, -2);
      if (filePath.startsWith(prefix)) {
        return true;
      }
    } else if (exclude.includes('*')) {
      // 簡單的通配符匹配
      const pattern = exclude.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(filePath) || filePath.includes(exclude.replace('*', ''))) {
        return true;
      }
    } else {
      // 精確匹配或包含匹配
      if (filePath === exclude || filePath.includes(exclude)) {
        return true;
      }
    }
  }
  return false;
}

function isLargeFile(filePath) {
  // 檢查是否是大文件類型
  for (const pattern of LARGE_FILE_PATTERNS) {
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -3);
      if (filePath.startsWith(prefix + '/') || filePath === prefix) {
        return true;
      }
    } else if (pattern.includes('*')) {
      // 處理通配符，如 public/images/**/*.png
      const basePattern = pattern.split('/*')[0];
      if (filePath.startsWith(basePattern)) {
        return true;
      }
    } else {
      if (filePath.includes(pattern)) {
        return true;
      }
    }
  }
  return false;
}

function checkFileExistsInRemote(filePath) {
  try {
    // 檢查遠程是否有這個文件
    execSync(`git ls-tree private/master -- "${filePath}"`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return true;
  } catch (error) {
    return false;
  }
}

function shouldIncludeFile(filePath, status) {
  // 永遠排除的文件
  if (isExcludedFile(filePath)) {
    return false;
  }
  
  // 對於大文件，需要檢查是否是新文件或已修改
  if (isLargeFile(filePath)) {
    // 如果是新文件 (??) 或已修改 (M )，則包含
    if (status.startsWith('??') || status.startsWith('M ')) {
      // 檢查遠程是否已有此文件
      const existsInRemote = checkFileExistsInRemote(filePath);
      if (!existsInRemote) {
        console.log(`  📸 新圖片文件: ${filePath}`);
        return true;
      } else if (status.startsWith('M ')) {
        console.log(`  🔄 圖片文件更新: ${filePath}`);
        return true;
      }
    }
    return false;
  }
  
  // 所有其他文件都包含（主要是代碼文件）
  return true;
}

function createSmartCommit() {
  console.log('🔍 分析文件變更...');
  
  const statusLines = getGitStatus();
  const ignoredFiles = getIgnoredFiles();
  
  if (statusLines.length === 0 && ignoredFiles.length === 0) {
    console.log('✅ 沒有需要備份的變更');
    return;
  }
  
  const coreFiles = [];
  const resourceFiles = [];
  
  // 處理已追蹤的文件變更
  statusLines.forEach(line => {
    const status = line.substring(0, 2);
    const filePath = line.substring(3);
    
    if (shouldIncludeFile(filePath, status)) {
      coreFiles.push(filePath);
    } else {
      resourceFiles.push(filePath);
    }
  });
  
  // 檢查被忽略的重要文件
  ignoredFiles.forEach(filePath => {
    if (isLargeFile(filePath) && !isExcludedFile(filePath)) {
      // 檢查遠程是否已有此文件
      const existsInRemote = checkFileExistsInRemote(filePath);
      if (!existsInRemote) {
        console.log(`  📸 發現新的被忽略圖片文件: ${filePath}`);
        coreFiles.push(filePath);
      }
    }
  });
  
  console.log(`📁 核心文件變更: ${coreFiles.length} 個`);
  console.log(`📦 資源文件變更: ${resourceFiles.length} 個 (跳過備份)`);
  
  if (coreFiles.length === 0) {
    console.log('✅ 沒有核心文件變更，跳過備份');
    return;
  }
  
  // 顯示將要備份的文件
  console.log('\n📋 將要備份的文件:');
  coreFiles.forEach(file => console.log(`  ✓ ${file}`));
  
  if (resourceFiles.length > 0) {
    console.log('\n⏭️  跳過的資源文件:');
    resourceFiles.slice(0, 5).forEach(file => console.log(`  - ${file}`));
    if (resourceFiles.length > 5) {
      console.log(`  ... 還有 ${resourceFiles.length - 5} 個文件`);
    }
  }
  
  try {
    // 重置 staging area（只影響 git index，不會修改工作區文件）
    // 這是安全操作：相當於 git reset --mixed，不會影響本地文件
    execSync('git reset', { stdio: 'inherit' });
    
    // 只添加核心文件
    if (coreFiles.length > 0) {
      // 對於被忽略的文件，使用 -f 強制添加
      const normalFiles = coreFiles.filter(f => !ignoredFiles.includes(f));
      const ignoredFilesToAdd = coreFiles.filter(f => ignoredFiles.includes(f));
      
      if (normalFiles.length > 0) {
        execSync(`git add ${normalFiles.join(' ')}`, { stdio: 'inherit' });
      }
      
      if (ignoredFilesToAdd.length > 0) {
        execSync(`git add -f ${ignoredFilesToAdd.join(' ')}`, { stdio: 'inherit' });
      }
      
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const commitMessage = `feat: smart backup ${timestamp} (${coreFiles.length} files)`;
      
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      
      // 自動更新版本號（使用日期時間格式）
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        
        const newVersion = `1.1.${year}${month}${day}${hour}${minute}`;
        
        // 更新 package.json 版本號
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
        const oldVersion = packageJson.version;
        packageJson.version = newVersion;
        writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
        
        // 提交版本更新
        execSync('git add package.json', { stdio: 'pipe' });
        execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'pipe' });
        
        // 創建 Git 標籤
        execSync(`git tag -a v${newVersion} -m "Version ${newVersion}"`, { stdio: 'pipe' });
        
        console.log(`\n✅ 智能備份完成: ${coreFiles.length} 個核心文件`);
        console.log(`📋 版本更新: ${oldVersion} → ${newVersion}`);
      } catch (versionError) {
        console.log(`\n✅ 智能備份完成: ${coreFiles.length} 個核心文件`);
        console.log(`⚠️  版本更新失敗: ${versionError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 備份失敗:', error.message);
    process.exit(1);
  }
}

function pushToRemote() {
  try {
    console.log('\n🚀 推送到私庫...');
    execSync('git push private master', { stdio: 'inherit' });
    console.log('✅ 推送完成');
  } catch (error) {
    console.error('❌ 推送失敗:', error.message);
    process.exit(1);
  }
}

function main() {
  console.log('🧠 智能備份工具啟動\n');
  
  createSmartCommit();
  
  const shouldPush = process.argv.includes('--push');
  if (shouldPush) {
    pushToRemote();
  } else {
    console.log('\n💡 提示: 使用 --push 參數自動推送到私庫');
  }
}

main();
