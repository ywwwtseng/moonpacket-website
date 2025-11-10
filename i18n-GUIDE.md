# moonpacket i18n 國際化指南

本指南說明如何正確維護本專案的多語言系統。

## 角色與流程

### zh-TW 是母語來源

- **一切新文案必須先寫進 `src/i18n/messages/zh-TW/*.json`**。
- 任何新字串 key 不可以直接硬寫在 `.astro` 或 component 裡，必須先進 zh-TW 對應的 JSON。
- zh-TW 是所有多語言版本的原型，其他語言都必須以 zh-TW 為準。

### en-US 必須完整對齊

- en-US 必須跟著建立相同 key 結構，並翻成正式英文。
- **不得留機器殘渣、不要留中文，也不要放 `__TODO__`**。
- 每個 key 的層級、命名必須與 zh-TW 完全一致。

### story.json 特殊規則

- story.json（Moonini 故事 / halving / 聲明）現在是公開資訊，會在 zh-TW 與 en-US 都渲染。
- **刪這塊或改 key 之前必須同步兩邊**。
- 不要只改 zh-TW 而忘了改 en-US。

## 首頁渲染規則

### 禁止使用不存在的 namespace

- **首頁 `src/pages/[lang]/index.astro` 不可以再使用 `messages.landing` 這種不存在的 namespace**。
- 應使用實際存在的 namespace：`messages.metrics`、`messages.common`、`messages.waterfall`、`messages.story`。

### 禁止硬編碼英文 fallback

- **不可以再寫 `|| 'Some English text'` 這種 fallback**。
- 所有文案都必須從對應的 JSON 檔案讀取。

### 正確的命名空間使用

- **Metrics 區塊標題**：從 `messages.metrics.title` 取得。
- **Waterfall 區塊標題**：從 `messages.common.sections.waterfall_title` 取得。
- **其他區塊**：請使用 `messages.common.*`、`messages.waterfall.*` 等實際存在的 namespace。

### Moonini 故事區塊

- **現在用 `{messages.story && (...)}` 來決定是否顯示**，不能再用 `lang === 'zh-TW'`。
- 這樣只要該語言有 story.json，就會自動顯示；沒有就不顯示。

## 命名與檔案結構

### common.json（共用 UI）

- 應放共用 UI 字詞：buttons（按鈕）、錯誤訊息、區塊標題等。
- 例如：`cta.banner`、`errors.stale`、`sections.waterfall_title`。

### metrics.json, waterfall.json, story.json, site.json

- 這些是頁面或大模組級別的區塊文案。
- 例如：
  - `metrics.json`：數據總覽相關的字串
  - `waterfall.json`：瀑布流相關的字串
  - `story.json`：Moonini 故事相關的完整敘述
  - `site.json`：網站層級的字串（title、description 等）

### 不要混用

- **不要把 JSX/HTML 結構移到翻譯檔，只能放純字串**。
- 翻譯檔是純數據，不包含任何渲染邏輯。

## 驗證步驟

### 執行檢查腳本

每次修改或新增 key 後，請執行：

```bash
pnpm i18n:check
```

### 處理錯誤

- 如果報錯，先修 zh-TW / en-US 的鍵集合一致，再 commit。
- 不要在有 key 不一致的情況下 commit。

## 常見問題

### Q: 如果 zh-TW 和 en-US 的 key 不一致會怎樣？

A: `pnpm i18n:check` 會失敗並列出缺失的 key，你必須補齊後才能繼續。

### Q: 我可以在 .astro 檔案裡直接寫中文嗎？

A: **不行**。所有文案都必須在 JSON 檔中，然後透過 i18n key 讀取。

### Q: 某個語言沒有某個檔案會怎樣？

A: 如果在 `src/pages/[lang]/index.astro` 使用正確的檢查（例如 `messages.story && (...)`），該語言沒有該檔案時，該區塊就不會渲染，不會報錯。

### Q: 我可以用 `||` 提供 fallback 嗎？

A: **不可以**。請確保所有需要的 key 都存在於對應語言的 JSON 檔中。

## 總結

1. 所有文案先寫進 zh-TW 的 JSON
2. en-US 必須完整對齊 key，翻成正式英文
3. 不要用不存在的 namespace，不要硬編碼 fallback
4. 每次改動後執行 `pnpm i18n:check` 驗證

