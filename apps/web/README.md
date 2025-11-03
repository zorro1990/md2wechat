# MD2WeChat Web 编辑器

MD2WeChat 是面向公众号创作者的所见即所得 Markdown → 微信富文本编辑器。它在浏览器端完成 Markdown 转换、主题切换、兼容性校验与一键复制，帮助创作者把排版时间压缩到最小。

## 功能亮点
- **实时预览**：Web Worker 负责 Markdown 转换，5000 字文章平均 0.8s 内完成富文本渲染。
- **多主题切换**：内置 6 套主题（黑金、清新绿意、科技蓝等），界面右上角可即时切换并应用到预览。
- **兼容性检查**：提供「运行兼容性检查」面板，对外链、表格、代码块等敏感内容给出风险提示与成功率。
- **草稿管理**：基于 IndexedDB 自动保存草稿、主题选择，可导出 JSON 备份。

## 快速开始
```bash
npm install
npm run dev --workspace apps/web
```

浏览器访问 `http://localhost:5173`，默认加载最近草稿。左侧为 Markdown 输入、右侧为微信富文本预览。

### 常用命令
| 命令 | 描述 |
|------|------|
| `npm run dev --workspace apps/web` | 本地开发（Vite + React Fast Refresh） |
| `npm run build --workspace apps/web` | 生成生产构建并执行类型检查 |
| `npm run test:unit --workspace apps/web` | Vitest 单元测试 |
| `npm run test:e2e --workspace apps/web` | Playwright 端到端测试（需配置公众号测试账号） |
| `npm run lint --workspace apps/web` | ESLint 校验 |

## 目录说明
- `src/features/editor/`：Markdown 输入区、自动保存、草稿导出。
- `src/features/preview/`：预览面板与 Worker 渲染绑定。
- `src/features/themes/`：主题切换 UI。
- `src/features/compatibility/`：兼容性评估逻辑与报告面板。
- `src/conversion/`：remark/rehype 管线及微信定制插件。
- `src/themes/`：内置主题 token 与运行时应用入口。
- `src/utils/storage.ts`：IndexedDB 封装用于草稿、主题、兼容报告持久化。
- `tests/`：Vitest 单测与 Playwright E2E 用例。

## 主题扩展
内置主题定义位于 `src/themes/presets.ts`。新增主题时：
1. 在 `BUILTIN_THEMES` 数组中添加 token 配置（CSS 变量）。
2. ThemeSwitcher 会自动显示新主题。
3. 若需更细致的组件样式，可扩展 `ThemePreset.components` 并在样式层消费。

## 兼容性检查
- 点击预览面板下方的「运行兼容性检查」将生成 `CompatibilityReport`，结果会展示在同一面板。
- 报告会分析外部链接数量、HTML 字段、表格/图片/代码块规模，并给出成功率估算。
- 成功率 <95% 时建议根据提示调整文稿或拆分章节。

## 部署
1. 执行 `npm run build --workspace apps/web`，产物位于 `apps/web/dist/`。
2. 使用任意静态托管（Vercel、Cloudflare Pages 等）发布，需开启 HTTPS。
3. Content Security Policy 建议允许 `blob:`、`data:` 以支持 Worker 与图片预览。
4. 部署后运行标准文稿粘贴回归，更新 `docs/results/us1.md` 中的兼容性记录。
