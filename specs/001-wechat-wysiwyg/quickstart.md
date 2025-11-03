# Quickstart: MD2WeChat 所见即所得编辑器

## 1. 项目初始化
1. 确保已安装 Node.js ≥ 20 与 npm 10。
2. 在仓库根目录执行：
   ```bash
   npm install
   npm run dev --workspace apps/web
   ```
3. 浏览器打开 `http://localhost:5173`，确认编辑器加载成功。

## 2. 目录速览
- `apps/web/src/components/`：通用 UI 组件（编辑器框架、按钮、弹窗）。
- `apps/web/src/features/editor/`：Markdown 输入区逻辑、自动保存。
- `apps/web/src/features/preview/`：富文本预览、主题切换。
- `apps/web/src/conversion/`：remark/rehype 管线与微信 DOM 映射规则。
- `apps/web/src/workers/`：Web Worker 入口，处理 Markdown 解析与性能统计。
- `apps/web/src/themes/`：内置主题定义与运行时主题管理。
- `apps/web/tests/`：Vitest 单元与 Playwright 端到端测试。

## 3. 常用命令
| 命令 | 作用 |
|------|------|
| `npm run dev --workspace apps/web` | 启动本地开发服务器（含 HMR） |
| `npm run build --workspace apps/web` | 产出生产构建并运行类型检查 |
| `npm run test:unit --workspace apps/web` | 运行 Vitest 单元测试 |
| `npm run test:e2e --workspace apps/web` | 运行 Playwright 端到端用例 |
| `npm run lint --workspace apps/web` | 执行 ESLint |

## 4. 开发流程提示
- 主题开发：在 `apps/web/src/themes/presets.ts` 新增 token，或通过 `ThemeSwitcher` 调整运行时主题，刷新即可生效。
- 转换规则：在 `apps/web/src/conversion/pipeline.ts` 添加 rehype 插件，运行 `npm run test:unit --workspace apps/web` 校验转换结果。
- 剪贴板调试：使用浏览器 devtools 模拟权限拒绝，确认降级提示正常。
- 兼容性测试：通过界面中的「运行兼容性检查」生成报告，或执行 `npm run test:e2e --workspace apps/web` 走 Playwright 流程（需预置测试账号 cookies）。

## 5. 部署概览
- 构建结果位于 `apps/web/dist/`，通过静态托管（例如 Vercel、Cloudflare Pages）发布。
- 需配置 HTTPS 与 CSP，允许 `blob:`、`data:` 用于图片预览、Web Worker 与剪贴板降级。
- 部署后执行标准测试文稿粘贴回归，生成兼容性报告并归档到 `docs/results/`。
