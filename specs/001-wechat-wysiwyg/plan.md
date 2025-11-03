# Implementation Plan: MD2WeChat 所见即所得编辑器

**Branch**: `001-wechat-wysiwyg` | **Date**: 2025-11-02 | **Spec**: [specs/001-wechat-wysiwyg/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-wechat-wysiwyg/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

构建一个桌面浏览器端的所见即所得 Markdown → 微信富文本编辑器，实现单页写作、预览、主题切换与一键复制流程，保证 1 秒内预览刷新与 ≥95% 微信粘贴兼容率。方案采用 React + TypeScript 前端应用，内置转换引擎（remark/rehype + WeChat 定制规则），以浏览器本地存储托管草稿并提供导出备份，并在最终阶段量化效率提升与 NPS 指标。

## Technical Context

**Language/Version**: TypeScript 5.x + React 18（Vite 构建）  
**Primary Dependencies**: remark/rehype 转换栈、Tailwind CSS 主题系统、Zustand 状态管理、clipboard-polyfill  
**Storage**: 浏览器 IndexedDB（通过 idb-keyval 封装）  
**Testing**: Vitest + React Testing Library（单元），Playwright（端到端）  
**Target Platform**: 桌面 Chrome / Edge / Safari 最新稳定版  
**Project Type**: web（单页应用 + 转换引擎）  
**Performance Goals**: 5000 字、10 张图文档预览刷新 ≤1 秒；脚本执行 p95 < 1200ms  
**Constraints**: 离线可用（不依赖服务端 API）、预览与复制流程 ≤2 步、粘贴兼容率 ≥95%  
**Scale/Scope**: 首批 1k 创作者试用，日均 300 场景；主题不少于 6 套，代码库 <20k 行

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- 简洁优先：单页写作/预览/复制流程 ≤2 步，取消账号登录与复杂配置，仅保留主题切换与导出备份。
- 美感一致：UI 由设计规范输出主题 token，所有主题通过微信粘贴截图回归确认与设计签审。
- 高效转换：转换引擎采用增量 diff + web worker，监控 5000 字文稿刷新耗时并记录性能埋点。
- 微信兼容：建立标准测试文稿集，每次构建后在公众号后台粘贴比对，外链转换为脚注组件。
- 可拓展演进：转换内核与主题层模块化，暴露配置接口并在文档中标注二次开发 hook，保持核心流程轻量。
- 用户优先体验：默认加载最近草稿，新增功能需验证不增加必填项；收集反馈表并在版本纪要中回溯。
- 诚信透明交付：仅使用本地存储，复制提示说明不会上传内容；兼容性风险通过发布说明公开。

**Gate Status**: PASS（所有约束均有落实方案，未发现需豁免项目）

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── components/
├── conversion/
├── features/
├── themes/
├── hooks/
├── pages/
├── workers/
└── utils/

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: 单仓前端项目，采用 `apps/web` 目录。核心源代码位于 `apps/web/src/`（components、features、themes、workers），转换规则 `apps/web/src/conversion/`，测试对应 `apps/web/tests/`。README 与部署脚本保留在根目录。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
