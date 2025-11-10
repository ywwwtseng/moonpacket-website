# moonpacket / moonpocket 开发规则（必须遵守）

## 0. 总览

这个专案会长期线上运营，禁止随意推翻已经定型的 UI / 文案 / 法务。

开发节奏是「一个功能一小块」逐步上线，而不是"大重构"。

## 1. 语言与 i18n 规范（必须遵守）

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

## 2. 链接、品牌常量

`src/config/links.ts` 是唯一可信来源，集中定义：

- 品牌名称 / 专案对外名称
- 官网 URL
- Telegram 公群 / 客服 Telegram
- X (Twitter) 帐号
- YouTube

页面或组件不可以自己手写这些链接，也不可以本地写死某个群组 invite link。

如果现在还没有真实链接，先放占位符在 `links.ts`，页面用占位符渲染没关系，以后统一改 `links.ts` 就会全站更新。

## 3. FROZEN 区（锁区，不准乱改）

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

请在这些文件顶部放醒目注释（如果还没放就加上）：

```javascript
/**
 * 🔒 FROZEN COMPONENT - DO NOT MODIFY STRUCTURE OR TEXT CONTENT
 * Owner: Yves
 * Only allowed changes:
 * 1) move hardcoded text into i18n messages (zh-TW first)
 * 2) replace inline links with LINKS from src/config/links.ts
 */
```

**Cursor 必须看到这个注释就打住。**

## 4. 新功能 / 实验区

- 新的页面、功能、组件，先放在 `src/experimental/...` 或 `src/features/<feature-name>/...`
- 现有稳定组件不要整份重写，尤其不要直接改锁区
- 实验区写好后，由人类把它挑干净再合回正式位置

换句话说：

- 旧的、上线中的代码 = 不要碰结构
- 新想法 / 新版本 = 新文件夹做草稿，不要把旧的覆盖掉

## 5. 开发分支策略

- `main`：线上可用 / 审过 / 合规文件。禁止 Cursor 直接改。
- `dev`：整合后的开发分支。
- `feature/...`：每次请 Cursor 工作时，请在自己的 feature 分支进行，而不是在 main 上直接改。

**Cursor 的行为要求：**

- 修改请集中在当前 feature 分支
- 不要"顺手"修其它无关文件
- 不要把锁区大量 diff 掉

## 6. 字体加载

我们不再尝试本地 variable font（`/fonts/Inter-VariableFont_opsz,wght.ttf`, `Sora-Variable.woff2` 这类）。

全站字体请由 `BaseLayout.astro` `<head>` 里的 `<link href="https://fonts.googleapis.com/...">` 统一注入 Inter / Sora 的稳定 woff2。

不要再新增本地 `@font-face` unless owner 允许。

不要删 Tailwind class / typography class。

## 7. 典型禁止事项（Cursor 特别要注意）

❌ 不要把中文或英文硬编码到组件 JSX/HTML 里  
✅ 要用 `messages.???` 或父组件传进来的 props

❌ 不要输出 `[object Object]`：渲染 UI label 时只能塞字串，不能塞整包对象

❌ 不要自动"英文优先"  
✅ fallback 永远是繁体中文 (zh-TW)

❌ 不要对 Header / Footer / terms / privacy 做任何"重构"

❌ 不要乱删区块或 CSS class

❌ 不要移除已存在的视觉结构

❌ 不要把 API 动态回传的数据硬写在 i18n

❌ 不要加浏览器语言侦测自动切英文（以后再说）

❌ 不要更换品牌名称、服务名称、法务条款措辞

## 8. 范例：群组卡片/分页区（groups 页面）

群组列表 UI 上这些字必须来自 i18n（`messages.groups.*`）：

- "最新" / "熱門"
- "搜尋群組…"
- "擁有者："
- "成員"
- "累計發送"
- "本期發送"
- "上一頁" / "下一頁"
- "27 個群組（第 1 / 3 頁）" → `"{{count}} 個群組（第 {{page}} / {{pages}} 頁）"`

**动态数据（不用放 i18n）：**

- 群组名称
- owner 昵称
- members 数字
- total sent 数字
- sent 数字
- page / pages / count 等具体数字

跑马灯（ticker）也是同逻辑：句子模板进 i18n，变量值来自数据。
