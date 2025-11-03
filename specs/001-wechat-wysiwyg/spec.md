# Feature Specification: MD2WeChat 所见即所得编辑器

**Feature Branch**: `001-wechat-wysiwyg`  
**Created**: 2025-11-02  
**Status**: Draft  
**Input**: User description: "打造一个极简、高效、所见即所得的 Markdown → 微信排版 Web 编辑器。 - 支持 Markdown 转换为微信富文本； - 支持多主题样式； - 支持实时预览与富文本复制； - 不包括小程序／非微信生态输出（后期可扩展）。 - 微信公众号创作者； - 自媒体编辑与内容运营人员； - 独立写作者与品牌方。 为创作者提供一键排版体验，减少格式调整时间，让内容创作回归创作本身。 - Markdown → 富文本转换； - 所见即所得实时预览； - 一键复制粘贴至公众号后台； - 多主题样式选择； - 支持图片、表格、代码块、引用等兼容渲染； - 输出样式微信后台兼容率 ≥95%。 - 微信编辑器富文本规则变化； - 样式偏好多样化； - 商业化转化率不确定； - 浏览器兼容问题。 - 输出兼容率 ≥95%； - 平均排版时间节省 ≥50%； - 用户满意度 ≥90%； - NPS ≥30； - 用户月活增长持续3个月以上。"

## Clarifications

### Session 2025-11-02

- Q: 草稿内容需要如何保存与同步？是否允许云端存储或账号体系？ → A: 浏览器本地自动保存，无需登录。

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 即时排版创作 (Priority: P1)

作为公众号创作者，我希望在浏览器中输入 Markdown 时即可看到同步更新的富文本预览，这样我能一边写作一边确认排版效果，无需来回切换工具。

**Why this priority**: 这是创作者完成内容创作的核心流程，直接决定是否能实现“写作 + 排版”一体化。

**Independent Test**: 录入一篇含图片、表格、代码块和引用的 Markdown 文稿，验证预览区域是否在 1 秒内同步呈现与微信富文本一致的效果。

**Acceptance Scenarios**:

1. **Given** 用户在编辑器左侧输入或粘贴 Markdown 文本，**When** 停止输入 1 秒，**Then** 右侧预览区域展示匹配微信富文本样式的内容且不出现格式错乱。
2. **Given** Markdown 中包含图片、代码块、表格与引用，**When** 用户保存草稿，**Then** 预览中的所有元素保持微信兼容的排版结构。

---

### User Story 2 - 多主题快速切换 (Priority: P2)

作为自媒体编辑，我希望能在编辑过程中一键切换不同主题样式，并立即看到预览中的变化，从而根据品牌调性挑选最合适的排版风格。

**Why this priority**: 多主题是区分产品的关键卖点，帮助创作者输出风格统一的内容。

**Independent Test**: 在已有 Markdown 草稿上循环切换各个主题，确认预览即时更新且样式保持统一。

**Acceptance Scenarios**:

1. **Given** 用户选择主题 A 并打开文稿，**When** 切换到主题 B，**Then** 预览在 1 秒内更新为主题 B 的配色、字体和组件样式，无需刷新页面。
2. **Given** 用户在任意主题下修改正文，**When** 切换到其他主题，**Then** 所有结构化元素（标题、列表、引用等）保持语义一致，仅视觉样式变化。

---

### User Story 3 - 一键复制与兼容校验 (Priority: P3)

作为品牌方写作者，我希望在排版完成后可以一键复制富文本并获得微信兼容提示，这样粘贴到公众号后台后无需额外修正格式。

**Why this priority**: 复制与兼容性直接影响发布效率，是衡量工具价值的关键指标。

**Independent Test**: 将生成的富文本复制到微信公众平台测试账号，确认至少 95% 的格式保持一致，并且工具内提供兼容结果提示。

**Acceptance Scenarios**:

1. **Given** 用户完成排版，**When** 点击“一键复制”按钮，**Then** 系统将富文本内容放入剪贴板并提示复制成功。
2. **Given** 富文本复制成功，**When** 用户在微信公众平台编辑器粘贴，**Then** 页面布局、样式和内嵌媒体的正确率达到或超过 95%，并在工具中记录此次验证结果。

---

### Edge Cases

- 长篇文章（≥10000 字或含 50+ 图片）是否仍能在 1 秒内完成预览刷新？
- 用户粘贴含外链或非微信兼容元素时，如何提示并提供脚注替换方案？
- 浏览器禁用剪贴板访问或用户拒绝授权时，如何引导手动复制且保持格式？
- 网络波动或保存失败时，如何保持最新 Markdown 草稿不丢失？

## Requirements *(mandatory)*

> **宪法校验提示**：说明本功能如何维持简洁流程、保证 Markdown → 微信富文本一键转换、达到 ≥95% 微信粘贴正确率，并在必要时记录主题/扩展点的模块化要求。

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Users MUST be able to 在单页界面中输入或粘贴 Markdown 文稿，并实时看到富文本预览，无需额外切换视图。
- **FR-002**: System MUST 在用户停止输入 1 秒内完成 Markdown → 微信富文本的预览刷新，保证主流文章内容不卡顿。
- **FR-003**: System MUST 支持并正确渲染标题、列表、引用、图片、表格、代码块等常用 Markdown 元素，确保渲染结构与微信富文本兼容。
- **FR-004**: Users MUST be able to 在任意阶段一键复制富文本内容到剪贴板，并在复制后获得成功提示与粘贴指引。
- **FR-005**: System MUST 内置不少于 5 套官方主题，并允许用户在 1 秒内切换主题且保持整体视觉一致性。
- **FR-006**: System MUST 执行微信兼容性校验，确保粘贴正确率 ≥95%，并在可能导致不兼容的内容出现时给出替换或脚注方案。
- **FR-007**: System MUST 在浏览器本地自动保存 Markdown 草稿与当前主题选择，无需账号登录，并提供手动导出备份避免数据丢失。

### Key Entities *(include if feature involves data)*

- **ArticleDraft**: 记录 Markdown 原文、预览所需的结构化信息、最后编辑时间与所选主题。
- **ThemePreset**: 定义富文本样式的名称、配色、字体规格与组件样式约束，确保跨主题视觉统一。
- **CompatibilityReport**: 存储最近一次兼容性校验的结果，包括成功率、发现的问题类型与建议处理方式。

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 创作者平均排版时间较现有流程减少 ≥50%（调研对照）。
- **SC-002**: 复制并粘贴到微信公众平台后的格式正确率 ≥95%。
- **SC-003**: Markdown → 富文本预览刷新时间在 5000 字、10 张图的文稿场景中 ≤1 秒。
- **SC-004**: 用户体验满意度调查结果 ≥90%，季度 NPS ≥30，并连续 3 个月保持月活用户增长。

## Assumptions & Dependencies

- 假设目标用户熟悉 Markdown 基础语法，不提供 Markdown 入门教学。
- 假设上线初期仅以桌面浏览器为主要访问渠道，移动端适配列入后续扩展。
- 草稿保存仅依赖浏览器本地存储，不提供云端同步或账号体系。
- 当前范围不包含小程序或非微信生态的内容导出，后续版本再扩展。
- 依赖微信编辑器当前粘贴规则及其公开行为，如官方规则变动需在 7 天内更新兼容策略。
