---
title: Contributing
version: v1.0.1
updated: 2025-10-03
owner: moonpacket-core
---

# Contributing

## 语言与 i18n 规范（必须遵守）

**zh-TW = 母稿 / 权威 / fallback**

- `defaultLocale` 必须是 `'zh-TW'`
- `fallbackLocale` 也使用 `'zh-TW'`
- 所有页面在 key 缺失时 fallback 到繁体中文，而不是英文。

**文案来源：**

- 所有出现在画面上的文字，必须来自 `src/i18n/messages/<locale>/*.json`
- 组件和页面不可以硬编码用户可见的中文、英文、日文等字串。
- 例外：`console.log`、`aria-label`、纯调试信息允许暂时用英文，不会渲染给使用者看的才可以。

**母稿流程：**

- 任何新文案，先加到 `src/i18n/messages/zh-TW/<xxx>.json`
- 同时在 `src/i18n/messages/en-US/<xxx>.json` 建同名 key，但 value 可以直接复制繁体中文占位。
- 不需要即时翻译英文或其他语言，这不是本阶段重点。

**动态数据 vs 固定标签：**

- API 回传的东西（群组名称、成员数、金额、owner 名称等）是"动态数据"，不要放进 i18n。
- UI 上的标签/标题/按钮文字（例如 "擁有者："、"成員"、"上一頁"、"搜尋群組…"）必须放进 i18n。
- 跑马灯/瀑布流的句子要做模板式 key，比如 `"{{user}} 在 {{group}} 領取了 {{amount}} USDT"` 再由代码去 `.replace()` / 模板注入变量。

## FROZEN 区（锁区，不准乱改）

以下文件结构和内容被视为「定版区域 / 合规区域 / 品牌一致性区域」：

- `src/pages/[lang]/terms.astro`
- `src/pages/[lang]/privacy.astro`
- `src/layouts/BaseLayout.astro`
- 全站 Header / Footer 组件（导航、页脚）
- 品牌/法务声明区、FAQ 大段说明文

**"锁区"的意思：**

- 不可以重写 DOM 结构
- 不可以重排 className / Tailwind class
- 不可以删除段落
- 不可以进行任何所谓的"UI 改善"、"文案优化"

**唯一允许的动作只有：**

- 把里面硬编码的文字抽出去放到 i18n
- 把重复链接改成用 `links.ts`

## 新功能 / 实验区

- 新的页面、功能、组件，先放在 `src/experimental/...` 或 `src/features/<feature-name>/...`
- 现有稳定组件不要整份重写，尤其不要直接改锁区
- 实验区写好后，由人类把它挑干净再合回正式位置

## 开发分支策略

- `main`：线上可用 / 审过 / 合规文件。禁止 Cursor 直接改。
- `dev`：整合后的开发分支。
- `feature/...`：每次请 Cursor 工作时，请在自己的 feature 分支进行，而不是在 main 上直接改。

**Cursor 的行为要求：**

- 修改请集中在当前 feature 分支
- 不要"顺手"修其它无关文件
- 不要把锁区大量 diff 掉

## Branch / Deploy Policy

### Master 主線策略

- **`master` 是唯一主線**：所有日常修改（文案修正、補 key、翻譯補充、小修）直接 commit 到 `master`
- **`snapshot-*` 分支謹慎使用**：
  - 只在需要進行高風險大重構時才建立（大量刪檔、重新佈局、遷移架構、i18n 結構大改）
  - 日常情況禁止自動建立 `snapshot-*`
  - 必須在建立前先獲得授權
  - 建立後僅作為備份，不在 snapshot 分支上進行開發

### 公開倉庫與部署

- **公開倉庫 `moonpacket-site` 代表正式對外網站與 moonpacket.com**
- **嚴禁自動 push、自動部署**
- 只有在我明確下指令「執行部署」時才能更新公開倉庫
- 日常修改只針對私庫 `moonpacket`，不觸碰 `moonpacket-site`

## Source of Truth for Copy / 語言來源

- **en-US（英文）是法律上以及產品敘述上的主版本文案，視為具法律約束力的正式版本**
- **zh-TW（繁體中文）是針對使用者的在地化翻譯版本，用於可讀性與在地溝通**
  - zh-TW 文案不可自動覆寫為英文，也不可被英文草稿直接蓋掉
- 其他語言（未來 ja-JP 等）同樣視為翻譯版本，僅供理解，不是法律主文本
- 所有使用者可見文字都必須來自 `src/i18n/messages/<locale>/*.json`
  - `public/data/*.json` 可以保留 key 參考（例如 `descKey` / `acceptKey`），但不可再塞實際句子

## Namespaces / JSON Files

- `landing.json`：首頁 hero / CTA / metrics / nav / footer
- `claim.json`：Claim FAQ
- `send.json`：Send FAQ
- `roadmap.json`：產品路線圖（每個 phase 的 title/desc/accept）
- `legal.json`：法律頁面使用到的 labels（版本、更新、Owner、附錄標題、服務調整標題）、以及 `legal.notice.*` 這類 disclaimer
- `common.json`（如存在或未來需要）：全站共用按鈕、導覽標題等
- **key 命名慣例**：`<namespace>.<section>.<id>`，不得用中文當 key 名

## Fallback Strategy

- 當前 fallback 行為（commit cc4212c + 後續修正）：
  - 如果目前語系是 en-US：
    1. 使用 en-US
    2. 若無對應，fallback 到 zh-TW
    3. 若仍無，顯示 key
  - 如果目前語系是 zh-TW：
    1. 使用 zh-TW
    2. 若無對應，fallback 到 en-US
    3. 若仍無，顯示 key
  - 未來語言（例如 ja-JP）：
    1. 使用該語言
    2. fallback en-US（英文，作為法律/產品主文本）
    3. 再 fallback zh-TW（在地敘述）
    4. 再 fallback key
- fallback 實作必須集中管理在同一個 i18n helper，不允許 component 自己亂搞 fallback

## Legal Pages (privacy.astro / terms.astro) Policy

- **en-US 的條款與隱私權聲明是主要、具法律效力的版本**
- 任何其他語系（包含 zh-TW）都視為翻譯／參考版本
- 在非 en-US 語系（例：zh-TW）渲染條款頁時，頁面最前面必須顯示 `legal.notice.disclaimer_binding`，清楚表示「英文版為準」
- 禁止將中文條文宣稱為法律唯一版本
- 禁止自動機器翻譯整篇條文並當成正式英文；英文條文必須經過人審且由我們視為正式文本後才能取代內容
- 任何對 legal 條文正文本體的改動，都必須由 repo owner 主動指示

## Workflow for Adding or Updating a Page for Multi-Language

- **Step A**: 稽核該頁的硬編文字並生成報告（不動程式）
- **Step B**: 提 key 命名＋zh-TW 文案＋en-US 文案（或其他語言草案），仍不動程式
- **Step C**: 等 repo owner 說 OK
- **Step D**: 實際落地：
  - 寫入各語系 JSON
  - component 改成讀 key
  - zh-TW 顯示不可以壞
  - en-US 應能顯示英文
  - Legal 頁面：對非英文語系顯示「英文為準」的 disclaimer；不可亂翻長段條文

## 开发流程

1. Fork and clone
2. `pnpm i`