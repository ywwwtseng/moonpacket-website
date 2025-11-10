# 公開發布安全性分析

## 當前發布腳本分析

### 1. `scripts/publish-public.mjs` ⭐ 推薦

#### ✅ 安全點
1. **使用臨時目錄** - 在 `.tmp-public` 中操作，不影響原工作區
2. **白名單機制** - 只複製明確允許的文件：
   ```javascript
   const WL = [
     ['dist', '.'],                                    // 構建產物
     ['README.md', 'README.md'],                       // 說明文件
     ['UI-GUIDELINES.md', 'UI-GUIDELINES.md'],         // UI 指南
     ['docs/CHANGELOG.md', 'docs/CHANGELOG.md'],       // 更新日誌
     ['docs/PUBLICATION-POLICY.md', 'docs/PUBLICATION-POLICY.md'], // 發布政策
   ];
   ```
3. **自動重建** - 使用正確的 `SITE` 環境變量重新構建
4. **刪除 sourcemap** - 自動刪除 `*.map` 文件
5. **禁用 GPG** - 在臨時倉庫中禁用 GPG 簽名
6. **最後清理** - 推送完成後刪除臨時目錄

#### ⚠️ 潛在風險
1. **本地構建** - 在原工作區執行 `pnpm build`，會生成 `dist/` 目錄
   - 風險：會修改本地的 `dist/` 目錄
   - 影響：可能覆蓋已有的構建產物
   - 建議：可接受，因為這是預期行為

2. **本地臨時目錄** - 使用 `.tmp-public` 作為臨時目錄
   - 風險：如果腳本中斷，臨時目錄可能殘留
   - 影響：佔用磁盤空間
   - 建議：在腳本開始時強制清理 `rmSync(TMP, { recursive: true, force: true })`

3. **git clone** - 執行 `git clone --depth=1 ${PUBLIC_REPO} ${TMP}`
   - 風險：拉取遠程倉庫到本地
   - 影響：如果遠程倉庫很大，會比較慢
   - 建議：已使用 `--depth=1`，只拉取最新版本，已優化

#### ✅ 總體評估
**安全** - 不會修改原工作區的源代碼，只在臨時目錄操作，推送後清理乾淨。

---

### 2. `scripts/publish-simple.mjs`

#### ✅ 安全點
1. **使用系統臨時目錄** - 在 `/tmp/moonpacket-public-deploy` 中操作
2. **只複製構建產物** - `cp -r ${OUT}/* ${TMP}/`
3. **獨立 git 倉庫** - 在臨時目錄初始化新倉庫
4. **禁用 GPG** - 禁用 GPG 簽名
5. **force push** - 使用 `--force` 推送到 `gh-pages` 分支
6. **最後清理** - 推送完成後刪除臨時目錄

#### ⚠️ 潛在風險
1. **本地構建** - 在原工作區執行 `pnpm build`
   - 風險：會修改本地的 `dist/` 目錄
   - 影響：可能覆蓋已有的構建產物
   - 建議：可接受，因為這是預期行為

2. **硬編碼 SSH Key** - 使用 `~/.ssh/id_ed25519_yves`
   - 風險：如果 SSH Key 路徑改變，會失敗
   - 影響：推送失敗
   - 建議：可以改為從環境變量讀取

3. **force push** - 使用 `--force` 推送
   - 風險：會覆蓋遠程分支歷史
   - 影響：無法回滾到之前的版本
   - 建議：對於靜態網站部署這是正常的

#### ✅ 總體評估
**安全** - 不會修改原工作區的源代碼，只在系統臨時目錄操作，推送後清理乾淨。

---

## 安全性對比

| 項目 | publish-public.mjs | publish-simple.mjs |
|------|-------------------|-------------------|
| 臨時目錄位置 | `.tmp-public`（項目內） | `/tmp/`（系統臨時） |
| 文件複製策略 | 白名單（更安全） | 只複製 dist |
| 遠程操作 | `git clone` + `git push` | 獨立 `git init` + `git push --force` |
| 清理機制 | 自動清理 | 自動清理 |
| 推薦程度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 改進建議

### 1. 統一使用白名單策略
建議在兩個腳本中都使用明確的白名單，確保不會意外洩漏私密文件。

### 2. 添加安全檢查
```javascript
// 在複製文件前檢查是否包含敏感文件
const BLACKLIST = [
  '.env',
  '.env.local',
  '.env.production',
  'id_rsa',
  'id_ed25519',
  '*.pem',
  '*.key',
  'secrets/',
];

function isSafe(filePath) {
  return !BLACKLIST.some(pattern => filePath.includes(pattern));
}
```

### 3. 添加構建前檢查
```javascript
// 檢查構建產物大小，避免意外包含大文件
const distSize = getDirectorySize('dist');
if (distSize > 100 * 1024 * 1024) { // 100MB
  console.warn(`⚠️ dist/ 大小異常: ${distSize}MB`);
  // 可以選擇中止或繼續
}
```

### 4. 錯誤處理與回滾
```javascript
try {
  // 執行推送
} catch (error) {
  console.error('❌ 推送失敗，正在清理...');
  // 清理臨時目錄
  rmSync(TMP, { recursive: true, force: true });
  process.exit(1);
}
```

---

## 結論

### ✅ 當前方法是安全的

兩個發布腳本都遵守了「不修改原工作區源代碼」的原則：

1. **只在臨時目錄操作** - 所有 git 操作都在臨時目錄進行
2. **只推送構建產物** - 不會推送源代碼、配置文件或私密信息
3. **自動清理** - 推送完成後自動刪除臨時目錄
4. **白名單機制**（publish-public.mjs）- 明確控制哪些文件可以公開

### 💡 推薦使用順序

1. **首選**：`pnpm publish:public` - 使用白名單，更安全
2. **備選**：`pnpm publish:simple` - 更簡單直接

### ⚠️ 唯一的「修改」

兩個腳本都會在原工作區執行 `pnpm build`，這會：
- 生成/更新 `dist/` 目錄
- 這是**預期行為**，不是安全風險
- 如果不想保留本地 `dist/`，可以在推送後手動刪除

### 🔒 進一步加強建議

如果要**完全不修改原工作區**，可以考慮：
```bash
# 在臨時目錄克隆倉庫並構建
tmpdir=$(mktemp -d)
git clone . "$tmpdir/build"
cd "$tmpdir/build"
pnpm install
SITE=... pnpm build
# 然後推送 dist/
```

但這會**非常慢**（需要重新安裝依賴），通常不推薦。

