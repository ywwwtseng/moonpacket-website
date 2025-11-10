# moonpacket 開發指南

> **重要**：每次啟動 Cursor 時，請先閱讀此指南
> 
> **版本**：1.0.1
> **最後更新**：2025-10-11

---

## 🚨 核心規則（必須遵守）

### 1. **新功能開發流程**
```bash
# ❌ 錯誤：先寫頁面代碼
<h1>關於新功能</h1>  # 硬編碼！

# ✅ 正確：先寫 i18n JSON
# 1. 在 src/i18n/messages/zh-TW/模組.json 寫文案
# 2. 再在頁面中使用 {messages.模組?.鍵名}
```

### 2. **絕對禁止硬編碼**
- 🚫 任何中文硬編碼
- 🚫 任何英文硬編碼（除防禦性 fallback）
- 🚫 品牌名必須保持：moonpacket, Moonini, $MOONINI

### 3. **每次提交前檢查**
```bash
pnpm scan:i18n     # 檢查硬編碼
pnpm i18n:sync     # 同步到所有語言
```

---

## 📁 項目結構

```
src/i18n/messages/
├── zh-TW/           # 主語言（先完成）
│   ├── site.json    # 網站通用（導航、頁腳、SEO）
│   ├── claim.json   # 領紅包頁
│   ├── send.json    # 發紅包頁
│   ├── privacy.json # 隱私政策
│   ├── terms.json   # 使用者條款
│   ├── waterfall.json # 瀑布流
│   └── story.json   # 故事頁（僅 zh-TW）
├── en-US/           # 英文
└── [其他 32 語言]/
```

---

## 🛠 常用命令

```bash
# 開發
pnpm dev --port 4321           # 啟動開發服務器
pnpm build                     # 構建
pnpm preview                   # 預覽

# i18n 工具
pnpm scan:i18n                 # 掃描硬編碼
pnpm i18n:diff                 # 檢查缺失翻譯
pnpm i18n:sync                 # 同步到所有語言

# 翻譯工具（zh-TW 完成後使用）
node scripts/i18n-export-csv.mjs > translations.csv
node scripts/i18n-import-csv.mjs translations.csv

# 備份
pnpm backup                    # 本地備份
pnpm backup:push               # 推送到私庫
```

---

## 📝 開發新功能步驟

### 步驟 1：規劃文案
```
# 例如：新增「提現」功能

需要的文案：
- withdraw.title: 提現
- withdraw.intro: 將您的資產提現到錢包
- withdraw.form.address_label: 錢包地址
- withdraw.form.amount_label: 提現金額
- withdraw.form.submit: 確認提現
- withdraw.errors.invalid_address: 錢包地址無效
```

### 步驟 2：創建 i18n 文件
```bash
# 創建新模組文件
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

### 步驟 3：註冊模組
```typescript
// src/i18n/loadMessages.ts
export type MessageModule = 
  | 'site'
  | 'claim' 
  | 'send'
  | 'withdraw'  // 新增

// 在 loadAllMessages 中添加
const modules: MessageModule[] = ['site', 'claim', 'send', 'withdraw', ...];
```

### 步驟 4：頁面中使用
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
pnpm i18n:sync
```

---

## 🎯 品質檢查清單

### 提交前必須檢查
- [ ] 運行 `pnpm scan:i18n`，確保無硬編碼
- [ ] 運行 `pnpm i18n:sync`，同步到所有語言
- [ ] 訪問頁面確認顯示正確
- [ ] 檢查 JSON 格式正確（無外層包裝）

### 常見錯誤
1. **JSON 外層包裝**：❌ `{"withdraw": {...}}` → ✅ `{...}`
2. **硬編碼中文**：❌ `<h1>關於功能</h1>` → ✅ `<h1>{messages.title}</h1>`
3. **忘記同步**：❌ 只改 zh-TW → ✅ 運行 `pnpm i18n:sync`

---

## 📚 重要文檔

- **[i18n-GUIDE.md](./docs/i18n-GUIDE.md)** - 完整的多語言開發規範
- **[i18n-MIGRATION-PLAN.md](./docs/i18n-MIGRATION-PLAN.md)** - 進度追蹤
- **[UI-GUIDELINES.md](./UI-GUIDELINES.md)** - 品牌和設計規範
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - 貢獻指南

---

## 🔧 故障排除

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

---

## 🔗 組件常量規範

### 固定連結和配置常量

**原則**：產品常量（如社群連結、API 端點、配置值）應該放在組件文件頂部作為 `const` 常量，而不是硬編碼在模板中，也不應該放在 i18n JSON 中。

**範例**：`src/components/SocialLinks.astro`

```astro
---
// 官方社群連結圖標組件
// 這些連結是固定常量，不屬於 i18n 翻譯內容

const LINKS = {
  tgChannel: "https://t.me/moonpacketofficial",
  tgGroup: "https://t.me/moonpacketchat",
  x: "https://x.com/mooniniofficial",
  yt: "https://www.youtube.com/@moonpacket",
};
---

<nav aria-label="Social links">
  <a href={LINKS.tgChannel}>...</a>
  <a href={LINKS.tgGroup}>...</a>
  <a href={LINKS.x}>...</a>
  <a href={LINKS.yt}>...</a>
</nav>
```

**何時使用此模式**：
- ✅ 社群媒體連結（Telegram, X, YouTube 等）
- ✅ API 端點 URL
- ✅ 配置常量（如最大文件大小、超時時間等）
- ✅ 不需要翻譯的產品常量

**何時不使用此模式**：
- ❌ 用戶可見的文字（應放在 i18n JSON）
- ❌ 需要本地化的內容
- ❌ 多個組件共享的常量（應放在 `src/config/` 目錄）

**多組件共享的常量**：
如果常量需要在多個組件中使用，應該放在 `src/config/links.ts` 或類似的配置文件中，而不是在組件內定義。

---

## 🎨 品牌規範

### 必須保持原樣
- **moonpacket** - 品牌名，全小寫
- **Moonini** - 吉祥物名稱
- **$MOONINI** - 代幣符號
- **Telegram** - 平台名

### 可本地化
- 紅包 → Red Packet
- 領取 → Claim
- 發送 → Send
- 提現 → Withdraw

---

## 📊 當前狀態

### ✅ 已完成
- zh-TW：100% 完成（373 鍵）
- 架構：穩定，支持 34 語言
- 工具：完整，自動化程度高
- 規範：清晰，易於遵循

### ⏳ 待完成
- 其他語言翻譯（等待 zh-TW 穩定後）
- 新功能開發（按規範進行）

---

## 🚀 開始開發

1. **閱讀規範**：`docs/i18n-GUIDE.md`
2. **啟動服務器**：`pnpm dev --port 4321`
3. **開發新功能**：先寫 zh-TW JSON，再寫頁面代碼
4. **檢查品質**：`pnpm scan:i18n`
5. **提交代碼**：遵循 Git 規範

---

**記住**：新功能從第一行代碼開始就用 i18n！
