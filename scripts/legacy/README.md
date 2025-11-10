# Legacy Scripts Archive

⚠️ **请不要再直接运行这些脚本，仅留存审计用**

此目录包含已弃用的 i18n 相关脚本：

- `i18n-export.v2.mjs` - v2 导出脚本（已被 v3 取代）
- `i18n-import.v2.mjs` - v2 导入脚本（已被 v3 取代）
- `i18n-export-csv.mjs` - 早期 CSV 导出脚本（已被 v3 取代）
- `i18n-import-csv.mjs` - 早期 CSV 导入脚本（已被 v3 取代）

**当前使用的脚本：**
- `scripts/i18n-export.v3.mjs` - 最新导出脚本
- `scripts/i18n-import.v3.mjs` - 最新导入脚本

**使用方法：**
```bash
pnpm i18n:export    # 导出翻译到 CSV
pnpm i18n:import    # 导入翻译回 JSON
```

这些旧脚本保留仅用于：
- 审计和历史参考
- 了解之前的实现方式
- 如有需要对比新旧实现
