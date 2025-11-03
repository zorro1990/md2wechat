# Research: MD2WeChat 所见即所得编辑器

## 决策与论证

### 1. 前端技术栈（React + TypeScript + Vite）
- **Decision**: 使用 React 18 + TypeScript 5 搭配 Vite 作为单页应用技术栈。
- **Rationale**: React 生态成熟，组件化适合构建所见即所得编辑器；TypeScript 有助于约束复杂的转换逻辑；Vite 提供快速热更新，利于频繁调试主题与预览。
- **Alternatives considered**:
  - Vue 3 + Vite：生态同样完善，但团队已有 React 组件资产，可减少重建成本。
  - Next.js：SSR 对纯前端工具收益有限，部署复杂度更高。

### 2. Markdown → 微信富文本转换方案
- **Decision**: 采用 remark/rehype AST 流水线，自定义 rehype 插件将 DOM 映射到微信兼容 HTML，并在尾部注入脚注区域管理外链。
- **Rationale**: remark/rehype 支持插件化，可精确控制节点转换；AST 层面可统一处理图片、表格、代码块；已有社区插件可扩展表格、代码高亮。
- **Alternatives considered**:
  - showdown/marked：实现简单，但 AST 能力与扩展性不足，不利于严格兼容。
  - 自研解析器：成本高，维护复杂度大。

### 3. 性能与线程策略
- **Decision**: 使用 Web Worker 承载 Markdown 解析与富文本生成，主线程负责 UI 与预览渲染。
- **Rationale**: 解析过程 CPU 密集，分离线程可避免大文档输入阻塞 UI；worker 可以缓存 AST，支持增量 diff。
- **Alternatives considered**:
  - 主线程直接转换：实现简单，但易在长文档场景造成卡顿。
  - Service Worker：适合缓存，非计算密集场景。

### 4. 草稿存储方案
- **Decision**: 通过 IndexedDB（idb-keyval）本地保存草稿、主题选择与历史版本，支持手动导出 JSON。
- **Rationale**: IndexedDB 对大文档更可靠；无需后端即可满足离线需求；idb-keyval 简化 API。
- **Alternatives considered**:
  - localStorage：简易但容量与同步性能受限。
  - 云端同步：违背“无需登录”目标，增加合规成本。

### 5. 剪贴板兼容策略
- **Decision**: 首选 Clipboard API，降级到 execCommand，并提供复制失败时的手动复制弹窗；引入 clipboard-polyfill 适配 Safari。
- **Rationale**: 满足现代浏览器一键复制，并对权限受限场景给出指引，确保“复制成功率”指标。
- **Alternatives considered**:
  - 仅使用 Clipboard API：Safari 旧版兼容性不足。
  - 仅提示手动复制：违背高效体验目标。

### 6. 微信兼容性验证流程
- **Decision**: 制定标准测试文稿（短文、长文、代码文）+ 主题矩阵，使用 Playwright 自动化打开微信公众平台测试号完成粘贴截图；人工抽检截图比对。
- **Rationale**: 自动化可重复执行，保障 95% 兼容率；截图便于设计与 QA 复核。
- **Alternatives considered**:
  - 完全人工测试：周期长，易遗漏。
  - 仅 HTML 对比：无法覆盖微信富文本渲染差异。

### 7. 主题系统设计
- **Decision**: 采用 CSS 变量 + Tailwind 插件，主题 token 存储在 JSON 中，可扩展自定义主题，同时保持核心样式一致。
- **Rationale**: CSS 变量可在运行时切换，Tailwind 便于生成 utilities；JSON 配置利于导出与高阶用户扩展。
- **Alternatives considered**:
  - 独立 CSS 文件：难以与组件逻辑联动。
  - Styled Components：主题切换需重新渲染样式，体积更大。
