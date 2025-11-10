# moonpacket 多語言開發指南

> **核心原則**：新功能從第一行代碼開始就使用 i18n，先寫 zh-TW，絕不硬編碼

**最後更新**：2025-10-11

---

## 📌 核心規則（必須遵守）

> **重要**：這個規範比原本的 i18n-WORKFLOW.md 更完善，支持多文件模組和 34 語言

### 🚫 絕對禁止

```astro
<!-- ❌ 錯誤：硬編碼中文 -->
<h1>關於領紅包</h1>
<p>使用 moonpacket 發紅包很簡單</p>

<!-- ❌ 錯誤：硬編碼英文 -->
<button>Click Here</button>
<p>Welcome to moonpacket</p>

<!-- ❌ 錯誤：混合硬編碼和 i18n -->
<h1>{messages.title || '關於領紅包'}</h1>  <!-- fallback 也不要硬編碼！ -->
```

### ✅ 正確做法

```astro
<!-- ✅ 正確：使用 i18n -->
<h1>{messages.claim?.title}</h1>
<p>{messages.claim?.intro}</p>

<!-- ✅ 正確：fallback 使用英文（語義化） -->
<button>{messages.cta?.label || 'Submit'}</button>

<!-- ✅ 正確：示意性內容可以硬編碼（API 範例等） -->
<pre><code>GET /api/user?id=123</code></pre>
```

---

## 🔄 開發流程（新功能）

### 步驟 1：規劃功能文案

在開始寫代碼前，先列出所有需要的文案：

```
# 例如：新增「提現」頁面

需要的文案：
- withdraw.title: 提現
- withdraw.intro: 將您的資產提現到錢包
- withdraw.form.address_label: 錢包地址
- withdraw.form.amount_label: 提現金額
- withdraw.form.submit: 確認提現
- withdraw.errors.invalid_address: 錢包地址無效
```

### 步驟 2：創建 i18n 文件

在 `src/i18n/messages/zh-TW/` 創建或更新對應模組的 JSON：

```bash
# 如果是新頁面，創建新模組文件
vi src/i18n/messages/zh-TW/withdraw.json
```

```json
{
  "title": "提現",
  "intro": "將您的資產提現到錢包",
  "form": {
    "address_label": "錢包地址",
    "amount_label": "提現金額",
    "submit": "確認提現"
  },
  "errors": {
    "invalid_address": "錢包地址無效"
  }
}
```

### 步驟 3：更新 loadMessages.ts

如果是新模組，需要註冊：

```typescript
// src/i18n/loadMessages.ts
export type MessageModule = 
  | 'site'
  | 'claim' 
  | 'send'
  | 'withdraw'  // 新增
  // ...

// 在 loadAllMessages 中添加
const modules: MessageModule[] = ['site', 'claim', 'send', 'withdraw', ...];
```

### 步驟 4：在頁面中使用

```astro
---
const messages = await import(`@/i18n/loadMessages`).then(m => m.loadAllMessages(lang));
---

<h1>{messages.withdraw?.title}</h1>
<p>{messages.withdraw?.intro}</p>
<form>
  <label>{messages.withdraw?.form?.address_label}</label>
  <input type="text" />
  <button>{messages.withdraw?.form?.submit}</button>
</form>
```

### 步驟 5：同步到其他語言

```bash
# 將 zh-TW 的鍵同步到所有語言（填入占位符）
pnpm i18n:sync
```

這會在所有語言文件中創建相同的鍵，值為 `⟪TODO⟫ zh-TW: <原文>`

---

## 📁 文件結構

```
src/i18n/messages/
├── zh-TW/           # 主語言（先完成這個）
│   ├── site.json    # 網站通用
│   ├── claim.json   # 領紅包頁
│   ├── send.json    # 發紅包頁
│   ├── withdraw.json # 提現頁（示例）
│   ├── privacy.json
│   ├── terms.json
│   ├── waterfall.json
│   └── story.json   # 僅 zh-TW
├── en-US/           # 英文
│   ├── site.json
│   └── ...
└── [其他 32 語言]/
    └── ...
```

**規範**：
- ✅ JSON 文件直接是內容對象，**不要外層包裝**
- ✅ 使用語義化的鍵名（如 `form.submit` 而非 `button1`）
- ✅ 保持 2 空格縮排
- ✅ 數組用於列表內容（如 FAQ 的多個段落）

---

## 🛠 常用命令

```bash
# 開發時檢查
pnpm scan:i18n              # 掃描硬編碼（開發時常運行）
pnpm i18n:diff              # 檢查哪些鍵缺翻譯

# 同步翻譯鍵
pnpm i18n:sync              # 同步 zh-TW 的鍵到所有語言

# 準備翻譯（zh-TW 完成後）
node scripts/i18n-export-csv.mjs > translations.csv
# 上傳到 Google Sheets → 翻譯 → 下載

# 導入翻譯
node scripts/i18n-import-csv.mjs translations.csv

# 本地測試
pnpm dev --port 4321        # 測試 zh-TW
pnpm dev --port 4321        # 訪問 /en-US/, /ja-JP/ 等測試其他語言
```

---

## 📝 JSON 結構範例

### ✅ 正確結構

```json
{
  "title": "關於領紅包",
  "intro": "簡單快速的領取流程",
  "faq": {
    "q1": "如何註冊？",
    "a1": "啟動機器人即可自動註冊。",
    "sections": {
      "getting_started": "開始使用"
    }
  },
  "cta": {
    "primary": "立即領取",
    "secondary": "了解更多"
  }
}
```

### ❌ 錯誤結構

```json
{
  "claim": {  // ❌ 不要外層包裝！loadMessages.ts 會自動處理
    "title": "關於領紅包"
  }
}
```

---

## 🎯 品牌名稱規範（必須遵守）

### 絕不翻譯
- **moonpacket** - 品牌名，全小寫，所有語言統一
- **Moonini** - 吉祥物名稱
- **$MOONINI** - 代幣符號
- **Telegram** - 平台名

### 可本地化的術語
| zh-TW | en-US | 說明 |
|-------|-------|------|
| 紅包 | Red Packet | 核心功能 |
| 領取 | Claim | |
| 發送 | Send | |
| 提現 | Withdraw | |

---

## 🔍 程式碼審查清單

提交代碼前檢查：

- [ ] 運行 `pnpm scan:i18n`，確保無硬編碼
- [ ] 所有文案都在 `zh-TW/*.json` 中
- [ ] 頁面使用 `messages.模組.鍵名` 訪問
- [ ] fallback 只用英文或不寫（依賴上層 fallback）
- [ ] JSON 格式正確（2 空格，無外層包裝）

---

## 🌍 翻譯流程（等 zh-TW 完成後）

### 1. 導出模板
```bash
node scripts/i18n-export-csv.mjs > translations.csv
```

### 2. 翻譯（Google Sheets）
- 上傳 CSV
- 邀請翻譯團隊或使用翻譯 API
- 優先語言：en-US, ja-JP, ko-KR, zh-CN, es-ES

### 3. 導入翻譯
```bash
node scripts/i18n-import-csv.mjs translations.csv
```

### 4. 驗證
- 檢查生成的 JSON 格式
- 測試各語言頁面
- 運行 `pnpm i18n:diff` 確認無遺漏

---

## 📚 支持的語言（34 個）

### 優先語言（流量前 10）
1. zh-TW（繁體中文）- 主語言
2. en-US（美國英文）
3. ja-JP（日文）
4. ko-KR（韓文）
5. zh-CN（簡體中文）
6. es-ES（西班牙文）
7. pt-BR（巴西葡萄牙文）
8. fr-FR（法文）
9. de-DE（德文）
10. ru-RU（俄文）

### 其他支持語言
en-GB, ar-SA, it-IT, nl-NL, sv-SE, da-DK, fi-FI, no-NO, pl-PL, cs-CZ, hu-HU, ro-RO, tr-TR, uk-UA, he-IL, fa-IR, ur-PK, hi-IN, id-ID, vi-VN, th-TH, bn-BD

---

## 🐛 常見錯誤與解決

### 錯誤 1：頁面顯示英文而非中文
**原因**：JSON 有外層包裝或 loadMessages 未正確加載

**檢查**：
```bash
# 檢查 JSON 結構
cat src/i18n/messages/zh-TW/claim.json | jq 'has("claim")'
# 應該返回 false（無外層包裝）

# 檢查是否在 loadMessages.ts 中註冊
grep "claim" src/i18n/loadMessages.ts
```

### 錯誤 2：新增鍵後其他語言沒同步
**解決**：
```bash
pnpm i18n:sync  # 自動同步所有語言
```

### 錯誤 3：翻譯後頁面還是顯示 ⟪TODO⟫
**原因**：CSV 導入時跳過了占位符

**檢查**：確保 CSV 中該格子有實際翻譯內容，而非空白或 `⟪TODO⟫`

---

## 🎓 最佳實踐

### 1. 模組劃分
- 按頁面/功能劃分模組（如 `claim.json`, `send.json`）
- 通用內容放 `site.json`（如 nav, footer）
- 大型功能獨立模組（如 `story.json`）

### 2. 鍵命名
- 使用點記法：`faq.q1`, `form.submit`
- 語義化：`cta.primary` 而非 `button1`
- 一致性：同類內容用相同前綴（如 `errors.`, `messages.`）

### 3. 內容組織
```json
{
  "title": "頁面標題",
  "sections": {
    "intro": "介紹章節",
    "features": "功能章節"
  },
  "faq": {
    "q1": "問題 1",
    "a1": "答案 1"
  },
  "cta": {
    "primary": "主要按鈕",
    "secondary": "次要按鈕"
  },
  "errors": {
    "not_found": "找不到內容"
  }
}
```

### 4. 特殊內容處理

**列表/數組**：
```json
{
  "steps": [
    "第一步：註冊",
    "第二步：驗證",
    "第三步：完成"
  ]
}
```

**多段落**：
```json
{
  "intro_paragraphs": [
    "第一段內容...",
    "第二段內容...",
    ""  // 空字串表示段落間隔
  ]
}
```

**HTML 內容**：
```json
{
  "content": "這是<strong>重點</strong>內容"
}
```

頁面中使用：
```astro
<div set:html={messages.content} />
```

---

## 📊 翻譯工作流程

### 階段 1：開發（僅 zh-TW）
```bash
# 1. 在 zh-TW/*.json 中寫文案
vi src/i18n/messages/zh-TW/new-feature.json

# 2. 頁面中使用
# 寫在 .astro 文件中：{messages.newFeature?.title}

# 3. 檢查無硬編碼
pnpm scan:i18n

# 4. 提交代碼
git add src/i18n/messages/zh-TW/
git commit -m "feat: 新功能 (zh-TW only)"
```

### 階段 2：同步其他語言（占位符）
```bash
# 同步鍵到所有語言（自動填 ⟪TODO⟫）
pnpm i18n:sync

# 提交
git add src/i18n/messages/
git commit -m "chore: sync i18n keys for new feature"
```

### 階段 3：準備翻譯
```bash
# 導出 CSV
node scripts/i18n-export-csv.mjs > translations.csv

# 上傳到 Google Sheets，邀請翻譯團隊
```

### 階段 4：導入翻譯
```bash
# 從 Google Sheets 下載 translations.csv

# 導入
node scripts/i18n-import-csv.mjs translations.csv

# 檢查
pnpm i18n:diff  # 應該顯示所有語言都已完整

# 提交
git add src/i18n/messages/
git commit -m "feat: add translations for new feature"
```

---

## 🌐 語言菜單與多語言開啟流程

### 菜單順序與來源
語言菜單的順序和內容由 `src/config/locales.ts` 定義：

**核心配置**：
- `LOCALE_ORDER`：按國際慣例排序的語言代碼數組
- `LOCALES`：語言元數據（本地名稱、英文名稱、RTL 標記）
- `listLocalesWithStatus()`：返回帶就緒狀態的語言列表

**菜單組件**：
- 位置：`src/components/LanguageMenu.astro`
- 自動檢測就緒狀態：檢查 `src/i18n/messages/<code>/site.json` 是否存在

### "就緒"判定
語言顯示為"可點擊"的條件：
- 必須存在 `src/i18n/messages/<code>/site.json` 文件
- 不需要所有 namespace 都完成，只要有 `site.json` 即可

### 新語言接入步驟

#### 方法 1：使用 i18n 同步工具（推薦）
```bash
# 1. 執行 i18n 同步（自動創建所有必要的 JSON 文件）
npm run i18n:apply -- --locale=<code>

# 2. 檢查生成的 site.json
cat src/i18n/messages/<code>/site.json

# 3. 訪問頁面驗證
# http://localhost:4321/<code>/
```

#### 方法 2：手動創建
```bash
# 1. 創建語言目錄
mkdir -p src/i18n/messages/<code>

# 2. 創建最小 site.json
cat > src/i18n/messages/<code>/site.json << 'EOF'
{
  "title": "moonpacket",
  "description": "cryptocurrency red packet platform",
  "nav": {
    "claim": "Claim",
    "send": "Send"
  },
  "footer": {
    "copyright": "All rights reserved.",
    "privacy": "Privacy",
    "terms": "Terms"
  }
}
EOF

# 3. 重啟開發服務器
pnpm dev

# 4. 訪問驗證
# http://localhost:4321/<code>/
```

### RTL 語言支持
RTL（Right-to-Left）語言自動支持：
- **已配置 RTL**：`ar-SA`、`fa-IR`、`he-IL`、`ur-PK`
- **布局自動適配**：`BaseLayout.astro` 根據語言代碼設置 `dir="rtl"`
- **樣式自動切換**：全局 CSS 使用邏輯屬性（`padding-inline-start` 等）

### 多語言開發注意事項

1. **保持順序一致性**：所有語言文件中的鍵順序應該一致，便於維護
2. **占位符處理**：未完成的翻譯使用 `⟪TODO⟫ zh-TW: <原文>`
3. **RTL 測試**：新增 RTL 語言時，務必測試布局是否正確
4. **SEO 配置**：新語言會自動添加到 `sitemap.xml` 和 `hreflang` 標籤

---

## 🛠 工具說明

### i18n:diff
檢查哪些鍵在其他語言中缺失

```bash
pnpm i18n:diff

# 輸出示例：
# {
#   "en-US": ["claim.faq.q10", "send.hero.title"],
#   "ja-JP": ["claim.faq.q10", ...]
# }
```

### i18n:sync
自動同步缺失的鍵到所有語言

```bash
pnpm i18n:sync

# 會在其他語言的 JSON 中添加：
# "faq.q10": "⟪TODO⟫ zh-TW: 原始中文內容"
```

### scan:i18n
掃描代碼中的硬編碼文字

```bash
pnpm scan:i18n

# 找到硬編碼時會報告行號和內容
```

### i18n-export-csv / i18n-import-csv
批量翻譯的導出/導入工具

```bash
# 導出所有文案到 CSV
node scripts/i18n-export-csv.mjs > translations.csv

# 翻譯完成後導入
node scripts/i18n-import-csv.mjs translations.csv
```

---

## 🌏 翻譯規範

### 品牌與術語
| 類型 | 處理方式 | 示例 |
|------|----------|------|
| 品牌名 | 保持原樣 | moonpacket, Moonini, $MOONINI |
| 平台名 | 保持原樣 | Telegram, Twitter/X |
| 幣種 | 保持原樣 | USDT, TON, SOL, ETH |
| 技術術語 | 統一翻譯 | Gas fee → 手續費（zh-TW）|

### 語氣風格
- **友好但專業**：平易近人但保持專業感
- **簡潔明瞭**：避免冗長句子
- **正面積極**：強調機會和好處

### 地區化注意
- **貨幣**：保持 $ 符號，數字格式本地化
- **日期**：遵循當地格式
- **RTL 語言**（ar-SA, fa-IR, he-IL, ur-PK）：自動處理排版

---

## 🕐 RTL 語言支援（從右到左）

### 自動處理
項目已完整支持 RTL（Right-to-Left）語言，無需額外配置：

**RTL 基準語言（Baseline）**：`ar-SA`

所有 RTL 的頁面與元件（首頁瀑布流、Send/Claim FAQ、圖片鏡像與對齊）以 `ar-SA` 的呈現為規範，其他 RTL 語言（`fa-IR`、`he-IL`、`ur-PK`）沿用同一套排版與樣式規則，不另行分支。

**已配置的 RTL 語言**：
- `ar-SA`（阿拉伯語）
- `fa-IR`（波斯語）
- `he-IL`（希伯來語）
- `ur-PK`（烏爾都語）

### 實現原理
1. **布局級方向**：`BaseLayout.astro` 自動檢測語言並設置 `dir="rtl"`
   ```astro
   const dir = isRTL(lang) ? 'rtl' : 'ltr';
   <html lang={lang} dir={dir}>
   ```

2. **CSS 邏輯屬性**：使用 `padding-inline-start`、`margin-inline-start` 等邏輯屬性
   ```css
   [dir="rtl"] .prose {
     text-align: start; /* 自動適應方向 */
   }
   
   [dir="rtl"] ul, [dir="rtl"] ol {
     padding-inline-start: 1.5rem; /* 而不是 padding-left */
   }
   ```

3. **字型設置**：RTL 語言使用 Vazirmatn 字型
   ```css
   [dir="rtl"] {
     font-family: 'Vazirmatn', 'Inter', system-ui, sans-serif;
   }
   ```

### 開發注意事項
- ✅ **使用邏輯屬性**：`inline-start/end` 而非 `left/right`
- ✅ **自動對齊**：按鈕、表單、列表會自動適應方向
- ✅ **品牌名稱不變**：moonpacket、moonini 等保持原樣
- ❌ **避免硬編碼**：不要寫 `margin-left` 等物理屬性

### 測試 RTL
```bash
# 訪問 RTL 語言頁面
open http://localhost:4321/ar-SA/

# 檢查 dir 屬性
curl -s http://localhost:4321/ar-SA/ | grep 'dir='
# 應該顯示：dir="rtl"
```

### 新增 RTL 語言
如需要支持更多 RTL 語言，在 `src/i18n/locales.config.ts` 添加：
```typescript
rtl: ['ar-SA', 'fa-IR', 'he-IL', 'ur-PK', '你的語言代碼'].includes(loc.code)
```

---

## ✅ 品質門禁

### 開發階段
- [ ] 無硬編碼（`pnpm scan:i18n` 通過）
- [ ] zh-TW 文案完整
- [ ] 已運行 `pnpm i18n:sync`

### 翻譯階段
- [ ] 無 `⟪TODO⟫` 占位符
- [ ] JSON 格式正確
- [ ] 品牌名稱保持原樣

### 發布前
- [ ] 所有語言都有翻譯
- [ ] 測試優先語言（前 10）
- [ ] SEO meta 標籤正確
- [ ] hreflang 標籤完整

---

## 🔗 相關資源

- [ADR-20251003-01](./ADR/ADR-20251003-01.md) - 架構決策
- [UI Guidelines](../UI-GUIDELINES.md) - 視覺規範
- [Contributing](../CONTRIBUTING.md) - 貢獻指南

---

## 📞 問題排查

### 頁面顯示英文而非中文
1. 檢查 JSON 結構：`cat src/i18n/messages/zh-TW/模組.json | jq 'keys'`
2. 檢查是否有外層包裝：應該直接看到 `title`, `faq` 等鍵
3. 檢查 `loadMessages.ts` 是否註冊了該模組
4. 重啟開發服務器

### 新增的鍵沒有顯示
1. 檢查鍵名拼寫：`messages.claim?.title`（注意大小寫）
2. 檢查 JSON 語法：`cat 文件.json | jq .`
3. 清除緩存：刪除 `.astro/` 目錄
4. 重啟開發服務器

### 翻譯導入後格式錯誤
1. 檢查 CSV 格式：確保引號和逗號正確
2. 手動修復 JSON：保持 2 空格縮排
3. 運行 `pnpm i18n:diff` 檢查完整性

---

## 💡 開發技巧

### 快速創建新模組

```bash
# 1. 複製模板
cp src/i18n/messages/zh-TW/claim.json src/i18n/messages/zh-TW/new.json

# 2. 清空內容，保留結構
echo '{"title": ""}' > src/i18n/messages/zh-TW/new.json

# 3. 填入文案
vi src/i18n/messages/zh-TW/new.json

# 4. 註冊到 loadMessages.ts
# 5. 同步到其他語言
pnpm i18n:sync
```

### 測試多語言

```bash
# 本地測試不同語言
open http://localhost:4321/zh-TW/
open http://localhost:4321/en-US/
open http://localhost:4321/ja-JP/

# 檢查 SEO
curl -s http://localhost:4321/zh-TW/ | grep "<title>"
curl -s http://localhost:4321/zh-TW/ | grep 'hreflang'
```

---

**記住**：新功能從第一行代碼開始就用 i18n，先寫 zh-TW JSON，再寫頁面代碼！

