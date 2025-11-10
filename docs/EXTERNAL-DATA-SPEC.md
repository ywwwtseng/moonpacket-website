---
title: Moonpacket 外部資料對接規範（靜態 JSON 版）
version: v1.0.0
updated: 2025-10-06
owner: data-integration
---

目的：以「GitHub Pages 靜態 JSON + 前端索引」最省成本方案，約定資料格式與更新規則。供第三方/數據提供方按本規範輸出 JSON，前端即可直接讀取並展示。

一頁摘要（最小必填）
- 只需交付四個 JSON 檔案（或同等內容路徑），前端可直接承接：
  1) `/data/metrics.json`
  2) `/data/groups.json`
  3) `/data/waterfall.json`
  4) `/data/hero-claim.json`（可選，跑馬燈）
- 數字規則：USDT 8 位小數；其他幣 2 位或保留原精度；整數用千分位；時間用 ISO8601（UTC）。
- 建議更新頻率：metrics 30–60s；waterfall 15–30s；groups 5–10 分鐘；hero-claim 視需要。

總覽
- 傳輸：HTTPS 靜態 JSON，UTF-8，CORS: *
- 時間：ISO 8601 UTC（例：2025-10-06T01:20:00Z）
- 數字：
  - 人數/次數：整數
  - 金額：Number；USDT 顯示小數 8 位（最少/最多 8 位）
- 快取：建議提供 ETag/Last-Modified；前端每 60s 重新抓取；可用 `Cache-Control: max-age=30, stale-while-revalidate=120`
- 版本：固定路徑（v1）；如有破壞性變更，提升版號或新增欄位而不移除舊欄位。

資料檔案一覽（建議路徑）
- 跑馬燈：`/data/hero-claim.json` 或語言特定文件 `/data/hero-claim-{lang}.json`（如 `/data/hero-claim-zh-TW.json`、`/data/hero-claim-en-US.json`）
- 群組清單（全量，或 manifest 指向分片）：`/data/groups.json`（或 `/data/groups-manifest.json`）
- 核心聚合數字（卡片用）：`/data/metrics.json`
- 瀑布流（最近 N 筆交易/領取事件）：`/data/waterfall.json`

1) 跑馬燈 hero-claim.json
```json
{
  "marquee": [
    "💰 John 在《Game Guild A》發出 100 USDT 紅包！"
  ],
  "events": [
    { "type": "send", "user": "John", "group": "Game Guild A", "amount": 100, "ccy": "USDT" },
    { "type": "claim", "user": "Lisa", "amount": 3.5, "ccy": "USDT" },
    { "type": "topup", "user": "Ken", "amount": 2000, "ccy": "USDT" }
  ],
  "groups_api": "/data/groups.json"
}
```
說明：
- 多語言建議：優先提供 `events`（結構化資料），我們在前端用 i18n 模板組成各語言；
- `marquee`（字串陣列）作為退路（僅單一語言時可用）。
- `groups_api`：群組清單 JSON 的完整 URL（可相對於站點 base path）。

2) 群組清單 groups.json（全量版）
```json
{
  "groups": [
    {
      "id": "grp_123",
      "name": "Moon Group A",
      "owner": "TON Builder",
      "members": 1275,
      "total_sends": 248,
      "total_amount": 9135,
      "updated_at": "2025-10-06T01:20:00Z",
      "status": "active",
      "tags": ["TON","meme"],
      "link": "https://t.me/xxxxx"
    }
  ]
}
```
欄位定義：
- `id`（string）：群組唯一識別碼，穩定不變。
- `name`（string）：群組名稱。
- `owner`（string）：群主顯示名。
- `members`（int）：群內人數。
- `total_sends`（int）：已送出紅包數（次數）。
- `total_amount`（number）：已送出紅包總金額（各幣種折算或僅主流幣，與 UI 顯示一致）。
- `updated_at`（string, ISO8601）：最新資料時間。
- `status`（"active"|"removed"|"hidden"）：可用於前端過濾。
- `tags`（string[]）：可選，方便分類/搜尋。
- `link`（string, url）：外部跳轉。

備選（分片）
- 若清單太大，改提供：
  - `/data/groups-manifest.json`：
    ```json
    { "version": "v1", "total": 25000, "updated_at": "2025-10-06T01:20:00Z", "shards": ["/data/groups-a.json","/data/groups-b.json"] }
    ```
  - 各分片 `groups-*.json` 結構與 `groups.json` 相同；前端依 manifest 載入。

3) 核心聚合數字 metrics.json
```json
{
  "metrics": {
    "groups_connected": 27123,
    "total_packets_sent": 913_842,
    "total_claimed_usdt": 123456.78000000
  }
}
```
規則：
- `groups_connected`：接入的群數量（整數）。
- `total_packets_sent`：已送出紅包總數（整數）。
- `total_claimed_usdt`：已被領取總額（USDT，number，最少/最多小數 8 位）。

多語言策略（關鍵說明）
- 對方「只需提供數據」：
  - 本規範所有欄位除 `name/owner/tags/link` 外，均為與語言無關的數字/ID。
  - 文字組裝（如「發送群：」「領取」）完全由我們前端 i18n 處理；
  - 金額/日期/數字的在地化由前端使用 Intl 完成（USDT 8 位等）。
- 專有名詞：群名 `name`、群主 `owner` 保留原文即可；若對方有多語可選，亦可提供：
  ```json
  { "name": "Moon Group A", "name_map": { "zh-TW": "月球群 A", "en-US": "Moon Group A" } }
  ```
  前端會優先取當前語言鍵，不存在時回退到 `name`。

語言特定數據文件（推薦）
- 跑馬燈數據可以按語言分別提供：
  - `/data/hero-claim-zh-TW.json` - 中文繁體數據
  - `/data/hero-claim-en-US.json` - 英文數據
  - `/data/hero-claim.json` - 默認數據（fallback）
- 前端會優先嘗試語言特定文件，如果不存在則使用默認文件
- 這樣可以確保每種語言都有合適的內容，避免混用不同語言的文本

4) 瀑布流 waterfall.json（最近 N 筆）
```json
{
  "items": [
    {
      "id": "evt_10001",
      "user": "Alice",
      "group": "Moon Club A",
      "link": "https://t.me/mooncluba",
      "amount": 12.30000000,
      "ccy": "USDT",       
      "ts": "2025-10-06T01:20:00Z",
      "total_amount": 190.00000000,
      "claimed_count": 20,
      "total_count": 100
    }
  ]
}
```
規則：
- 依 `ts` 由新到舊；建議提供 50–200 筆。
- `ccy`：USDT/ETH/SOL/TON 等；USDT 金額 8 位小數；其他幣種 2 位或原精度（前端可自行四捨五入）。
- 額外欄位（新版卡片排版）：
  - `total_amount`（number）：該次紅包總額（與 `ccy` 同單位）。
  - `claimed_count`（int）：已領取筆/份數。
  - `total_count`（int）：總份數。
 以上三個欄位若缺失，前端會回退使用合理預設（例如 `amount*100`、`0/100`）。

連結行為（可選建議）
- `link` 或 `group_link`（string, url）：群組外部連結。前端會將「發送群」渲染為可點擊超連結（`target="_blank"`、`rel="noopener"`）。
- 若未提供，前端可依群名做映射（只在示意/本地開發使用）。

更新頻率
- `metrics.json`：30–60s（或每分鐘）
- `waterfall.json`：15–30s（或具體活動節奏）
- `groups.json`：5–10 分鐘（若變動頻繁，改走 manifest 或增量 changes）
- `hero-claim.json`：視需要（變動時即可）

可選：增量檔 changes.json（提高同步效率）
```json
{
  "cursor": "seq_17000001234",
  "changes": [
    { "op": "upsert", "id": "grp_123", "updated_at": "2025-10-06T01:20:00Z", "data": { /* 同 groups 欄位 */ } },
    { "op": "remove", "id": "grp_999", "updated_at": "2025-10-06T01:18:00Z" }
  ]
}
```

品質與校驗
- JSON 必須有效；所有數字不帶千分位。
- `id`、`name`、`members`、`updated_at` 為必填（groups）；
- `metrics.total_claimed_usdt` 必須為 number，保留 8 位（如 `123.00000000`）。
- 建議提供 ETag；若內容未變前端可 304 省流量。

安全與流量
- 請避免在 JSON 暴露敏感資訊（私鑰、憑證、PII）。
- 如需限流，建議用 CDN；本規範預期靜態檔案由 CDN 快取。

聯絡
- 資料接入問題：data@moonpacket.example

---

附錄 B｜API 路由樣例（OpenAPI 格式，選讀；非 OpenAI）
> 說明：這裡的 OpenAPI 是一種「API 規格格式」標準，與 OpenAI（AI 服務）無關。本文不包含任何 AI/LLM 依賴，主要以 JSON 檔為主。

```yaml
openapi: 3.0.0
info:
  title: Moonpacket External API
  version: 1.0.0
servers:
  - url: https://provider.example.com
paths:
  /api/metrics:
    get:
      summary: Get aggregate metrics
      responses:
        '200':
          description: OK
          content:
            application/json:
              example:
                metrics:
                  groups_connected: 27123
                  total_packets_sent: 913842
                  total_claimed_usdt: 123456.78000000
  /api/waterfall:
    get:
      summary: Get recent waterfall items
      parameters:
        - in: query
          name: limit
          schema: { type: integer, default: 100 }
        - in: query
          name: since
          schema: { type: string }
      responses:
        '200':
          description: OK
          content:
            application/json:
              example:
                items:
                  - id: evt_10001
                    user: Alice
                    group: Moon Club A
                    link: https://t.me/mooncluba
                    amount: 12.30000000
                    ccy: USDT
                    ts: 2025-10-06T01:20:00Z
                    total_amount: 190.00000000
                    claimed_count: 20
                    total_count: 100
  /api/groups:
    get:
      summary: Get groups list
      responses:
        '200':
          description: OK
          content:
            application/json:
              example:
                groups:
                  - id: grp_123
                    name: Moon Group A
                    owner: TON Builder
                    members: 1275
                    total_sends: 248
                    total_amount: 9135
                    updated_at: 2025-10-06T01:20:00Z
                    status: active
                    link: https://t.me/mooncluba
  /api/groups/changes:
    get:
      summary: Get groups incremental changes
      parameters:
        - in: query
          name: since
          schema: { type: string }
        - in: query
          name: cursor
          schema: { type: string }
        - in: query
          name: limit
          schema: { type: integer, default: 1000 }
      responses:
        '200':
          description: OK
          content:
            application/json:
              example:
                cursor: seq_17000004567
                changes:
                  - op: upsert
                    id: grp_123
                    updated_at: 2025-10-06T01:20:00Z
                    data:
                      id: grp_123
                      name: Moon Group A
                  - op: remove
                    id: grp_999
                    updated_at: 2025-10-06T01:18:00Z
                next: seq_17000007890
```

附錄 C｜開發者快速檢核清單
- [ ] CORS 已開啟（`Access-Control-Allow-Origin: *`）。
- [ ] 回應附帶 `ETag` 或 `Last-Modified`，支援 `If-None-Match`。
- [ ] USDT 金額為 8 位小數、其他幣為 2 位或明確提供精度說明。
- [ ] `waterfall.items[*]` 含 `link`/`group_link`（若無則允許省略）。
- [ ] `groups`/`changes` 的 `id` 唯一且穩定；`updated_at` 單調遞增。
- [ ] `changes` 支援冪等與分頁（`cursor`/`next`），失敗可重試。
- [ ] 所有數字不帶千分位；時間為 ISO8601（UTC）。
- [ ] 提供 `/healthz`（200 OK）與 `/version`。
- [ ] 合理的 `Cache-Control`（建議 `max-age=30, stale-while-revalidate=120`）。
- [ ] 若有限流/鑑權（API Key/HMAC），請在交付前提供測試憑證與說明。
附錄 A｜有服務器時的最佳實踐（建議升級但保持低成本）

目標：在不增加你端成本的前提下，讓我們「一直拿到最新」，同時避免一次傳太多資料。

1) 變更流 API（推薦）
- `GET /api/groups/changes?since=<iso|seq>&cursor=<opaque>&limit=1000`
- 響應：
```json
{
  "cursor": "seq_17000004567",
  "changes": [
    { "op": "upsert", "id": "grp_123", "updated_at": "2025-10-06T01:20:00Z", "data": { /* 同 groups 欄位 */ }},
    { "op": "remove", "id": "grp_999", "updated_at": "2025-10-06T01:18:00Z" }
  ],
  "next": "seq_17000007890"  
}
```
- 說明：
  - `since` 可用我們上次保存的 `next` 值（或 ISO 時間）。
  - `cursor/next` 為不透明字串（遞增序號或水位），確保單向前進、可斷點續傳。
  - `limit` 控制批量大小；失敗可重試同一組 `since`/`cursor`（要求你方結果冪等）。

2) 搜尋 API（資料量大於 2–5 萬時再啟用）
- `GET /api/groups/search?q=<kw>&cursor=<opaque>&limit=30`
- 響應：
```json
{ "items": [{"id":"grp_123","name":"Moon Group A",...}], "next": "opaque_cursor" }
```
- 說明：
  - 關鍵字已做大小寫/全半形/重音正規化。
  - 依需要支持排序 `sort=latest|hot`。

3) 瀑布流分頁（避免一次載入過多）
- `GET /api/waterfall?since=<iso|seq>&cursor=<opaque>&limit=100`
- `items` 結構同 `waterfall.json` 的 `items`，再附 `next`。
- 事件去重：提供全域唯一 `id`（如 `evt_xxx`），冪等合併。

4) 核心聚合數字（即時）
- `GET /api/metrics` → 與 `metrics.json` 相同欄位；快取 30～60 秒。

5) 健康檢查與版本
- `GET /healthz` → 200/OK
- `GET /version` → `{ "version": "1.2.3", "updated_at": "..." }`

6) 安全與流量
- CORS: `Access-Control-Allow-Origin: *`
- 簽名/金鑰（可選）：`X-Api-Key: <token>` 或 `X-Signature: HMAC-SHA256(payload)`（我們這端只需單鍵驗證即可）。
- ETag 與 `If-None-Match`；Gzip/Br 壓縮；HTTP/2。

7) 一致性與資料質量
- `id` 穩定且唯一；`updated_at` 單調遞增，方便我們比較新舊。
- 金額/數字不帶千分位；USDT 小數 8 位；其他幣 2 位或原精度（請明確）。
- 刪除請以 `remove` 或 `status=removed` 傳遞；如需硬刪也請留 `id` 與 `deleted_at` 供稽核。

8) 示例 cURL
```bash
curl -H 'Accept: application/json' \
     'https://provider.example.com/api/groups/changes?since=seq_17000001234&limit=1000'
```

升級路線（仍維持前端零成本）
1) 先提供上述 API，我們端仍可用當前前端實作：
   - 初次讀 `/data/groups.json` → 之後每 60s 打 `/api/groups/changes` 疊代。
2) 若資料量再大：
   - 改讀 `/data/groups-manifest.json` + 分片；搜尋命中片段再增量更新。
3) 若搜尋需求複雜：
   - 只在搜尋時打 `/api/groups/search?q=...`；平時仍然本地索引/快取。


