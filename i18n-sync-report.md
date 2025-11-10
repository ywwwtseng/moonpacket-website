# i18n 同步报告 (2025-10-30T02:50:02.056Z)
- 目标语言：`zh-TW`
- CSV 行数：1210
- 更新：8，新增：1068，品牌/币种修正：18
- 跳过命名空间（保护 hero/跑马灯/瀑布流/动画）：waterfall

## 命名空间明细
### claim
- 更新：0，新增：152，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：5

### common
- 更新：0，新增：295，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：22

### groups
- 更新：0，新增：32，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：8

### landing
- 更新：0，新增：9，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：2

### legal
- 更新：0，新增：244，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：4

### metrics
- 更新：1，新增：5，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：1

### privacy
- 更新：0，新增：28，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：2

### roadmap
- 更新：0，新增：24，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：4

### send
- 更新：1，新增：130，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：4

### site
- 更新：1，新增：87，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：11

### story
- 更新：5，新增：32，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：9

### terms
- 更新：0，新增：30，跳过：0
- 项目中存在但 CSV 未提供的 key（保留原值）：2

### waterfall
- 更新：0，新增：0，跳过：18

## 代码使用检查
- 代码中使用但 **未找到任何定义** 的 key：13
```
tab
page
.
2d
div
span
/
node:fs/promises
node:path
@/i18n/loadMessages
li
@/i18n/pageI18n
~
```
- 定义了但 **代码未使用** 的 key（仅供参考）：128
```
claim:tabs
claim:search_placeholder
claim:ticker_templates
claim:groups
claim:pagination
claim:cta_launch
claim:section_title
claim:faq
common:site
common:nav
common:hero
common:features
common:features_desc
common:sections
common:groups_directory
common:tokens
common:testimonials
common:pricing
common:metrics
common:cta
common:form
common:errors
common:footer
common:a11y
common:claim
common:waterfall
common:terms
common:privacy
common:send
common:roadmap
groups:tabs
groups:search
groups:card
groups:pagination
groups:cta
groups:searchLabel
groups:searchPlaceholder
groups:empty
groups:pager
groups:marquee
groups:group
landing:hero
landing:metrics
legal:privacyTitle
legal:termsTitle
legal:version
legal:updated
legal:owner
legal:sections
legal:contact
legal:privacy
legal:terms
metrics:title
metrics:subtitle
metrics:latest
metrics:top_groups
metrics:total_sent
metrics:total_claimed
metrics:participants
metrics:avg_packet
metrics:sort
privacy:title
privacy:version
privacy:updated
privacy:owner
privacy:sections
privacy:content
roadmap:title
roadmap:updated
roadmap:bucket
roadmap:status
roadmap:accept
roadmap:lanes
roadmap:progressLabel
roadmap:phase
send:title
send:hero
send:faq
send:cta_launch_bot
send:cta_button_prefix
send:cta_button_suffix
send:footer_tip
send:features_desc
send:features
site:title
site:description
site:nav
site:hero
site:metrics
site:sections
site:errors
site:story
site:waterfall
site:footer
site:pricing
site:features
site:a11y
story:illustration_alt
story:title
story:origin
story:secrets_title
story:secrets_intro
story:secrets_flow
story:secrets_halving
story:schedule_title
story:schedule_headers
story:schedule_rows
story:cap_note
story:belief_title
story:belief_paragraphs
story:future_title
story:future_intro
story:future_list
story:disclaimer_title
story:disclaimer_paragraphs
story:closing
terms:title
terms:version
terms:updated
terms:owner
terms:sections
terms:content
waterfall:sent_from
waterfall:claimed
waterfall:total
waterfall:progress
waterfall:groups_directory
waterfall:marquee
```