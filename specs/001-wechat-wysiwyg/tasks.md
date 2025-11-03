# Tasks: MD2WeChat 所见即所得编辑器

**Input**: Design documents from `/specs/001-wechat-wysiwyg/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**宪法对齐检查**: 每个 user story 至少包含一次微信粘贴兼容验证、一次性能/效率确认（转换 ≤1 秒），并显式说明如何保持流程简洁、主题视觉一致与用户体验无额外负担。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化与基础开发体验

- [X] T001 初始化 `apps/web` Vite React 项目并配置 TypeScript、ESLint、Prettier（apps/web）
- [X] T002 安装核心依赖：React 18、Zustand、remark/rehype、Tailwind、clipboard-polyfill、idb-keyval（apps/web/package.json）
- [X] T003 建立基础目录结构（components/conversion/features/themes/workers/utils）（apps/web/src）
- [X] T004 配置 Tailwind 与 PostCSS，生成全局样式入口（apps/web/tailwind.config.ts, apps/web/src/styles/tailwind.css）
- [X] T005 搭建 Vitest + React Testing Library 与 Playwright 测试框架（apps/web/vitest.config.ts, apps/web/playwright.config.ts）
- [X] T006 在 Vite 中启用 Web Worker 支持与路径别名（apps/web/vite.config.ts）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心基础设施，保障所有用户故事可实施

- [X] T007 实现 IndexedDB 封装（idb-keyval）用于草稿读写服务（apps/web/src/utils/storage.ts）
- [X] T008 构建 Zustand 全局状态（草稿、主题、兼容结果）（apps/web/src/features/editor/store.ts）
- [X] T009 实现 Markdown 转换 Worker 通信骨架（主线程消息通道）（apps/web/src/workers/conversion.worker.ts）
- [X] T010 [P] 定义 remark/rehype 管线基础配置与插件注册点（apps/web/src/conversion/pipeline.ts）
- [X] T011 实现全局错误与降级提示系统（Toast/Modal）（apps/web/src/components/feedback）
- [X] T012 配置自动保存与节流机制（基础逻辑，暂不连预览）（apps/web/src/features/editor/autosave.ts）
- [X] T013 构建标准测试文稿与主题矩阵数据结构（apps/web/src/fixtures/test-cases.ts）

---

## Phase 3: User Story 1 - 即时排版创作 (Priority: P1) 🎯 MVP

**Goal**: Markdown 实时输入与富文本预览在 1 秒内同步，确保结构兼容微信。

**Independent Test**: 使用标准长短文稿在编辑器中输入/粘贴，验证预览刷新 ≤1 秒且布局无错乱。

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

- [X] T014 [P] [US1] 撰写转换管线单元测试覆盖标题/列表/图片/表格/代码块（apps/web/tests/unit/conversion.spec.ts）
- [X] T015 [P] [US1] 编写 Playwright 用例验证长文输入性能（apps/web/tests/e2e/editor-performance.spec.ts）

### Implementation for User Story 1

- [X] T016 [US1] 实现 Markdown 输入面板与本地草稿加载（apps/web/src/features/editor/EditorPane.tsx）
- [X] T017 [P] [US1] 实现预览面板渲染逻辑并与 Worker 绑定（apps/web/src/features/preview/PreviewPane.tsx）
- [X] T018 [US1] 构建 remark/rehype → 微信 DOM 映射插件集（apps/web/src/conversion/plugins/wechat-mapping.ts）
- [X] T019 [P] [US1] 实现 Web Worker 转换主流程：解析、HTML 生成、性能埋点（apps/web/src/workers/conversion.worker.ts）
- [X] T020 [US1] 集成自动保存节流与恢复流程（EditorPane + storage）（apps/web/src/features/editor/EditorPane.tsx）
- [X] T021 [US1] 完成预览性能监控与指标上报（apps/web/src/utils/perf-metrics.ts）
- [X] T022 [US1] 为手动导出草稿提供 JSON 下载按钮（apps/web/src/features/editor/EditorActions.tsx）
- [ ] T023 [US1] 运行并调优性能测试，确保刷新 ≤1 秒（apps/web/tests/e2e/editor-performance.spec.ts）
- [ ] T024 [US1] 记录 US1 实测结果与兼容性清单（docs/results/us1.md）

**Checkpoint**: 用户可完成 Markdown 写作并实时预览，性能与兼容性满足指标。

---

## Phase 4: User Story 2 - 多主题快速切换 (Priority: P2)

**Goal**: 提供不少于 6 套主题，1 秒内切换并保持视觉一致性。

**Independent Test**: 在同一文稿上循环切换所有主题，确认视觉风格变换且结构保持一致。

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T025 [P] [US2] 编写主题快照测试，确保 token 变更不会破坏结构（apps/web/tests/unit/themes.spec.ts）
- [ ] T026 [P] [US2] Playwright 用例：主题切换响应时间与视觉对比（apps/web/tests/e2e/theme-switch.spec.ts）

### Implementation for User Story 2

- [ ] T027 [US2] 定义主题 token Schema 与校验逻辑（apps/web/src/themes/schema.ts）
- [ ] T028 [P] [US2] 实现官方 6 套主题 token JSON 与说明（apps/web/src/themes/presets/*.json）
- [ ] T029 [US2] 构建主题切换控制条与 UI 状态（apps/web/src/features/preview/ThemeSwitcher.tsx）
- [ ] T030 [P] [US2] 实现 Tailwind 插件映射主题 token（apps/web/src/themes/tailwind-plugin.ts）
- [ ] T031 [US2] 渲染预览时根据主题注入 CSS 变量（apps/web/src/features/preview/PreviewPane.tsx）
- [ ] T032 [US2] 保存并恢复草稿关联主题（store + storage）（apps/web/src/features/editor/store.ts）
- [ ] T033 [US2] 进行主题切换性能测试与截图归档（apps/web/tests/e2e/theme-switch.spec.ts）
- [ ] T034 [US2] 汇总主题审查记录与设计验收（docs/results/us2.md）

**Checkpoint**: 主题切换流畅，视觉方案通过设计与兼容性验证。

---

## Phase 5: User Story 3 - 一键复制与兼容校验 (Priority: P3)

**Goal**: 提供一键复制/降级提示，并在微信后台粘贴保持 ≥95% 兼容率。

**Independent Test**: 准备标准文稿，执行复制 + 微信后台粘贴，比较布局并记录截图。

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T035 [P] [US3] Playwright 用例：模拟复制失败降级流程（apps/web/tests/e2e/clipboard-fallback.spec.ts）
- [ ] T036 [P] [US3] 自动化粘贴验证脚本生成截图（apps/web/tests/e2e/wechat-paste.spec.ts）

### Implementation for User Story 3

- [ ] T037 [US3] 实现复制按钮与成功/失败反馈 UI（apps/web/src/features/share/CopyButton.tsx）
- [ ] T038 [P] [US3] 集成 Clipboard API 并提供 execCommand 降级（apps/web/src/features/share/clipboard.ts）
- [ ] T039 [US3] 构建兼容性提示面板读取 CompatibilityReport（apps/web/src/features/share/CompatibilityPanel.tsx）
- [ ] T040 [P] [US3] 实现 Worker 侧兼容性分析接口 `/analyze` 并落库结果（apps/web/src/workers/conversion.worker.ts）
- [ ] T041 [US3] 运行自动化粘贴验证，整理成功率数据（apps/web/tests/e2e/wechat-paste.spec.ts）
- [ ] T042 [US3] 更新发布说明与用户粘贴指引（docs/results/us3.md, docs/guides/paste.md）
- [ ] T043 [US3] 汇总兼容性风险点并建立响应流程（docs/risk/wechat-compatibility.md）

**Checkpoint**: 一键复制与兼容校验完成，微信后台粘贴正确率 ≥95%，风险与指引均落实。

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: 全局优化、文档沉淀与可观察性补强

- [ ] T044 [P] 优化 Web Worker 缓存策略，减少重复解析（apps/web/src/workers/conversion.worker.ts）
- [ ] T045 [P] 补充性能指标上报到监控面板（apps/web/src/utils/perf-metrics.ts）
- [ ] T046 更新 Quickstart 与 README，记录部署注意事项（specs/001-wechat-wysiwyg/quickstart.md, README.md）
- [ ] T047 [P] 复核所有主题与文稿在 Safari/Edge 的兼容性（apps/web/tests/e2e/cross-browser.spec.ts）
- [ ] T048 清理技术债务与 TODO，确保核心流程无 Console 警告（apps/web/src）
- [ ] T049 收集首批试用反馈并建立反馈表渠道（docs/feedback/round1.md）
- [ ] T050 设计排版效率对照测试流程与表单模板，覆盖传统排版与工具流程（docs/experiments/time-saving-protocol.md）
- [ ] T051 执行效率基准测试并记录每名受测者的排版耗时数据（docs/experiments/time-saving-run1.md）
- [ ] T052 分析效率数据，将节省比例更新至指标追踪表（docs/metrics/sc001-time-savings.md）
- [ ] T053 设计并发放满意度 + NPS 调查问卷模板（docs/feedback/nps-survey.md）
- [ ] T054 汇总问卷结果并计算季度 NPS，更新指标档案（docs/metrics/sc004-nps.md）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖
- **Foundational (Phase 2)**: 依赖 Phase 1 完成；完成后开放所有用户故事
- **User Story 1 (P1)**: 依赖 Phase 2；完成后可视作 MVP
- **User Story 2 (P2)**: 依赖 US1 完成（复用预览结构）
- **User Story 3 (P3)**: 依赖 US2（主题渲染稳定后验证复制）
- **Polish**: 所有用户故事完成后执行

### User Story Dependencies

- **US1**: 无其他故事依赖，可独立交付 MVP
- **US2**: 基于 US1 的预览与主题钩子
- **US3**: 复用 US2 的主题渲染与 US1 的复制入口

### Within Each User Story

- 先完成测试（若包含）再实现功能
- 模块顺序：模型/配置 → 组件 → 接口 → 验证
- 确保每个故事结束前记录性能与兼容性结果

### Parallel Opportunities

- Setup 阶段任务 T002、T004、T005 可并行
- Foundational 阶段 T010 与 T011、T013 可并行
- US1 中 T017、T019 可并行（分别负责 UI 与 Worker）
- US2 中 T028、T030 可并行（主题 token 与 Tailwind 插件）
- US3 中 T038、T040 可并行（复制实现与 Worker 分析）

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. 完成 Phase 1 与 Phase 2 基础设施
2. 实现 User Story 1 全流程并验证性能/兼容性
3. 交付最小可用编辑器并收集初步反馈

### Incremental Delivery
1. US1：实时预览 MVP
2. US2：主题体系与实时切换
3. US3：复制与兼容校验闭环
4. Polish：跨浏览器、文档与监控补足

### Parallel Team Strategy
1. Setup + Foundational 阶段小组协作完成
2. US1 期间：Worker/转换 与 UI/状态 可分工并行
3. US2 期间：主题配置与 UI 控制分别推进
4. US3 期间：复制逻辑与 Playwright 粘贴测试平行执行
