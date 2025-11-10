# CURSOR.md — moonpacket Team Workflow

## 目标
- 所有 AI 改动"可追踪、可回退、可复用"。严禁在未扫描既有代码前直接大改或新建。

## 基本流程
1) 在 Chat/Composer 粘贴你的任务 + 相关文件路径。
2) Cursor 必须先输出 **PLAN**（受 .cursorrules 约束）：
   - 受影响文件、修改点、是否需要 [ALLOW_NEW_FILE]
3) 你确认后再执行修改；若超 8 个文件，拆分为多次小提交。

## 代码规范（关键）
- **Astro**：组件/HTML 不作为 prop 传入；需要富文本请传字符串并在组件内部 `set:html`；或在页面层做 brandify 后 `set:html`。
- **i18n**：禁止直接硬编码；新 key 仅加当前语言文件，并输出其它语言的 TODO 表。
- **数字/日期**：使用 `Intl`，跟随 `lang`；模拟数据只用于本地演示，UI 不得写死格式（例如 `toFixed(8)` 仅作 fallback）。
- **法律长文**：不截断、不隐藏；容器删除 `line-clamp/max-h/overflow-hidden/truncate`。
- **外部链接**：从 `site.externals` 或 `config/externals.ts` 读取。

## 提交规范
- `feat/fix/docs/refactor/style/test/chore(scope): summary`
- PR 必须包含：改动摘要、受影响页面截图（前/后）、如涉及 i18n 列出新增键。

## 常见任务模板
### A) 修法律页面（不建新文件）

任务：修复 zh-TW 的 ToS 全量渲染，统一联络方式为 support bot。禁止截断。
请按 .cursorrules 执行：先 PLAN 再改动，仅限：

src/i18n/messages/zh-TW/legal.json（terms.*）

src/pages/[lang]/terms.astro（去除 clamp/slice，引用 externals）

### B) 修 Astro 组件报错

任务：修 [lang]/terms.astro 属性里插入 <Brandify/> 导致的 parse error。
做法：属性传字符串；需要品牌化处改为 set:html 渲染或在子组件内处理。

## 故障排查
- 规则未生效？确认 `.cursorrules` 在仓库根目录；Chat/Composer 场景都能读取（Old Composer的一些版本不读取，请用 Chat 或新版 Composer）。必要时在规则里放一句"我在工作"测试。
- 需要多文件修改？使用 **Composer（Ctrl/Cmd + I）**，先让它列出改动清单。
