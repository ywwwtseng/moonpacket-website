# 版本號管理策略

> **版本號格式**：主版本.次版本.YYYYMMDDHHMM
> 
> **範例**：`1.1.202510112302`

---

## 📋 版本號格式說明

### 格式：`主版本.次版本.YYYYMMDDHHMM`

- **主版本**：重大架構變更（如：1 → 2）
- **次版本**：重要功能更新（如：1 → 2）
- **日期時間**：YYYYMMDDHHMM（年月日時分）

### 範例解析

```
1.1.202510112302
│ │ │
│ │ └── 2025年10月11日23時02分
│ └──── 次版本 1
└────── 主版本 1
```

---

## 🛠 版本號管理命令

### 自動版本更新（推薦）

```bash
# 備份時自動更新版本號
pnpm backup:push

# 手動更新版本號
pnpm version:bump
```

### 手動版本管理

```bash
# 查看當前版本
cat package.json | jq -r '.version'

# 查看所有版本標籤
git tag --sort=-version:refname | head -10
```

---

## 📅 版本號規則

### 1. 自動更新規則

- **備份時**：`pnpm backup:push` 會自動更新版本號
- **格式**：`1.1.YYYYMMDDHHMM`
- **時區**：本地時間

### 2. 手動更新規則

- **重大變更**：手動修改主版本號
- **功能更新**：手動修改次版本號
- **時間戳**：自動生成

### 3. Git 標籤

- **格式**：`v1.1.202510112302`
- **類型**：annotated tag
- **訊息**：`Version 1.1.202510112302`

---

## 🎯 版本號優勢

### 1. 時間可追溯性
```
1.1.202510112302  ← 一看就知道是 2025年10月11日 23:02
1.1.202510112315  ← 一看就知道是 2025年10月11日 23:15
```

### 2. 版本排序清晰
```
1.1.202510112302
1.1.202510112315
1.1.202510120001  ← 跨日也清楚
```

### 3. 部署追蹤容易
- 生產環境版本：`1.1.202510112302`
- 測試環境版本：`1.1.202510112315`
- 開發環境版本：`1.1.202510112320`

---

## 📊 版本號使用場景

### 開發階段
```bash
# 功能開發完成
pnpm backup:push
# 自動生成：1.1.202510112302

# 修復 bug
pnpm backup:push
# 自動生成：1.1.202510112315
```

### 發布階段
```bash
# 重大更新（手動修改主版本）
# package.json: "version": "2.0.202510112302"

# 功能更新（手動修改次版本）
# package.json: "version": "1.2.202510112302"
```

### 回滾場景
```bash
# 回滾到特定時間點
git checkout v1.1.202510112302

# 查看版本歷史
git log --oneline --decorate | grep "v1.1"
```

---

## 🔧 技術實現

### 備份腳本集成

`scripts/backup-smart.mjs` 會自動：
1. 檢測文件變更
2. 提交變更
3. 生成新版本號
4. 更新 package.json
5. 創建 Git 標籤

### 版本號生成邏輯

```javascript
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hour = String(now.getHours()).padStart(2, '0');
const minute = String(now.getMinutes()).padStart(2, '0');

const version = `1.1.${year}${month}${day}${hour}${minute}`;
```

---

## 📝 最佳實踐

### 1. 日常開發
- 使用 `pnpm backup:push` 自動更新版本
- 每次備份都會生成新的時間戳版本

### 2. 重要發布
- 手動修改主/次版本號
- 使用 `pnpm version:bump` 生成時間戳

### 3. 版本追蹤
- 定期查看 `git tag` 了解版本歷史
- 使用版本號快速定位問題時間點

### 4. 團隊協作
- 統一使用日期時間格式
- 避免手動修改時間戳部分

---

## 🚨 注意事項

### 1. 時間戳唯一性
- 同一分鐘內多次備份會覆蓋版本號
- 建議間隔至少 1 分鐘

### 2. 時區一致性
- 使用本地時間
- 團隊成員時區不同時需注意

### 3. Git 標籤管理
- 版本號會自動創建 Git 標籤
- 避免手動創建相同版本號的標籤

---

## 📚 相關命令

```bash
# 版本管理
pnpm version:bump          # 手動更新版本號
pnpm backup:push          # 備份並自動更新版本號

# 查看版本
cat package.json | jq -r '.version'    # 當前版本
git tag --sort=-version:refname        # 所有版本標籤
git log --oneline --decorate | grep "v" # 版本歷史

# 版本操作
git checkout v1.1.202510112302         # 切換到特定版本
git tag -d v1.1.202510112302           # 刪除版本標籤
```

---

**記住**：版本號是項目的時間線，使用日期時間格式讓每個版本都有明確的時間標記！
