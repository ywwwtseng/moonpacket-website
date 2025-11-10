#!/usr/bin/env node

/**
 * 版本號管理腳本
 * 使用日期時間格式：主版本.次版本.YYYYMMDDHHMM
 * 例如：1.1.202510112302
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const root = process.cwd();

function getCurrentVersion() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.error('❌ 無法讀取 package.json:', error.message);
    process.exit(1);
  }
}

function generateVersionNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `1.1.${year}${month}${day}${hour}${minute}`;
}

function updatePackageJson(newVersion) {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    packageJson.version = newVersion;
    writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ 已更新 package.json 版本為 ${newVersion}`);
  } catch (error) {
    console.error('❌ 更新 package.json 失敗:', error.message);
    process.exit(1);
  }
}

function createGitTag(version) {
  try {
    execSync(`git tag -a v${version} -m "Version ${version}"`, { stdio: 'inherit' });
    console.log(`✅ 已創建 Git 標籤 v${version}`);
  } catch (error) {
    console.error('❌ 創建 Git 標籤失敗:', error.message);
    process.exit(1);
  }
}

function main() {
  const currentVersion = getCurrentVersion();
  const newVersion = generateVersionNumber();
  
  console.log('📋 版本更新');
  console.log(`當前版本: ${currentVersion}`);
  console.log(`新版本: ${newVersion}`);
  console.log('');
  
  // 檢查是否有未提交的更改
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('⚠️  發現未提交的更改，請先提交再更新版本號');
      console.log('未提交的文件:');
      console.log(status);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 檢查 Git 狀態失敗:', error.message);
    process.exit(1);
  }
  
  // 更新 package.json
  updatePackageJson(newVersion);
  
  // 提交版本更新
  try {
    execSync('git add package.json', { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
    console.log('✅ 已提交版本更新');
  } catch (error) {
    console.error('❌ 提交版本更新失敗:', error.message);
    process.exit(1);
  }
  
  // 創建 Git 標籤
  createGitTag(newVersion);
  
  console.log('');
  console.log('🎉 版本更新完成！');
  console.log(`新版本: ${newVersion}`);
  console.log('💡 提示: 運行 "pnpm backup:push" 推送到私庫');
}

main();
