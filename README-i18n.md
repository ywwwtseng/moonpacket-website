# i18n 翻译流程规范（安全版）

## 角色
- 工程师：跑 export / import 脚本，合并翻译
- 翻译：只填翻译，不改结构

## 我们目前"正式支持"的语言
- zh-TW（繁中）
- zh-CN（简中）
- en-US（英文）

其它语言（ar-SA, ja-JP, ...）还没正式上线，不要动，不会出现在 export 里。

## 步骤

### 1. 工程师导出翻译 CSV
```bash
pnpm i18n:export
# 产生 i18n-export.csv
CSV 第一行是表头：

```
namespace,key,zh-TW,zh-CN,en-US
namespace：哪一块（claim / nav / hero / ...）

key：该块下面的路径；如果是 array，会带 .0, .1, ...

例如 faq.q1_body.0

别改这个

zh-TW / zh-CN / en-US：每个语言的原始文本
```

把 i18n-export.csv 丢到 Google Sheet 里给翻译人员。

### 2. 翻译规则（翻译人员必须遵守）
只改右边的翻译内容单元格。

不要新增行、不要新增列、不要改 namespace、key。

保留 `<br>`、`<span class="brand-mark">moonpacket</span>` 这种标签原样不动。

你可以翻译标签里面的文字，但标签本身和 class 名不能删、不能改。

如果还没翻好，可以留空。

空白代表"不要覆盖原本内容"。

FAQ 里的长段说明，常常是多行分段存在：

例如同一个问题 body 会拆成 ...body.0, ...body.1, ...body.2

不要把所有段落合并成一段

每段各自翻译那一行

如果觉得需要新增 key，请留言给工程师，不要自己硬加行。

Import 脚本不会自动新增新 key。

### 3. 工程师把翻回来的 CSV 存成 i18n-export.csv（覆盖旧的）
### 4. 工程师导入合并
```bash
pnpm i18n:import
```

这个步骤会：

载入 src/i18n/messages/zh-TW.json / zh-CN.json / en-US.json

用 CSV 的翻译尝试合并

仅在下列情况下真的会写回：

- 目标字段原本是 string，而 CSV 对应语言给了非空新内容
- 目标字段原本是 string[] 的某个 index，CSV 给了非空新内容
- 目标字段是 object / array<obj> 等：不会写，避免破坏结构
- CSV 该格是空字串：不会写，保留旧值

写完后脚本会把 JSON 覆盖写回（带格式化）。

### 5. 本地 QA
跑本地 dev，看页面有没有炸（FAQ 还分段？首页 hero 文案正常？claim / send / terms / privacy 没怪字串？）

没问题后才 commit messages 的变更，并发 PR。

## 非常重要的"不可以"
- 不可以直接手改 src/i18n/messages/*.json 然后跳过脚本。
- 不可以把 i18n-export.csv 的 namespace / key 改名。
- 不可以把多段落合并到一行（例如把 body.0~body.5 全部塞在 body.0 里）。
- 不可以删掉 `<br>` / `<span class="brand-mark">` 这种标签。
