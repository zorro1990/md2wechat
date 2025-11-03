# Data Model: MD2WeChat 所见即所得编辑器

## Overview
数据模型聚焦在浏览器本地管理的文稿、主题与兼容性校验结果，所有数据均存储于 IndexedDB，并支持导出/导入 JSON。

## Entities

### ArticleDraft
- **Description**: 单篇 Markdown 文稿及其关联的预览元数据。
- **Fields**:
  - `id` (string, UUID)：草稿唯一标识。
  - `title` (string)：文章标题，默认取 Markdown 一级标题。
  - `markdown` (string)：原始 Markdown 内容。
  - `astVersion` (number)：最近一次解析生成的 AST 版本号。
  - `previewHtml` (string)：最近一次生成的微信富文本 HTML（用于快速回显）。
  - `wordCount` (number)：字数统计，用于性能基线。
  - `mediaStats` (object)：`{ images: number, tables: number, codeBlocks: number }`。
  - `themeId` (string)：当前选用的主题标识。
  - `updatedAt` (ISO datetime)：最近更新时间。
- **Relationships**:
  - `themeId` 引用 `ThemePreset.id`。
  - 与 `CompatibilityReport` 通过 `draftId` 关联。
- **Lifecycle / State**:
  - 新建 → 编辑中（持续自动保存）→ 冻结（导出或复制后仍可继续编辑）。
- **Validation**:
  - Markdown 长度上限 100k 字符；超出提示拆分。
  - `previewHtml` 仅存储经过清洗的安全标签。

### ThemePreset
- **Description**: 预置或用户导入的主题定义。
- **Fields**:
  - `id` (string)：主题唯一标识，预置主题使用固定 slug。
  - `name` (string)：主题展示名称。
  - `tokens` (object)：CSS 变量 token（颜色、字体、行距等）。
  - `components` (object)：组件级样式参数，如标题装饰、引用样式。
  - `isBuiltin` (boolean)：是否为官方内置主题。
  - `createdAt` (ISO datetime)：创建时间（用户导入时记录）。
- **Relationships**:
  - 被 `ArticleDraft.themeId` 引用。
- **Validation**:
  - 主题配置需通过 schema 校验，确保缺省字段继承自基础主题。
  - 当 `isBuiltin = true` 时禁止用户直接修改，需通过版本迁移。

### CompatibilityReport
- **Description**: 最近一次对指定草稿进行的微信兼容性验证结果。
- **Fields**:
  - `id` (string, UUID)。
  - `draftId` (string)：关联草稿 ID。
  - `themeId` (string)：测试时使用的主题。
  - `successRate` (number, 0-100)：格式正确率。
  - `issues` (array)：每项包含 `{ type: 'link|style|media', description: string, severity: 'warning|critical' }`。
  - `testedAt` (ISO datetime)：验证时间。
  - `testSource` (string)：`'playwright' | 'manual'`。
  - `evidenceUrl` (string | null)：截图或录像的存储地址。
- **Relationships**:
  - `draftId` 引用 `ArticleDraft.id`。
  - `themeId` 引用 `ThemePreset.id`。
- **Lifecycle**:
  - 自动/手动触发测试 → 结果写入 → 供复制提示展示。
- **Validation**:
  - `successRate` 必须 ≥0 且 ≤100。
  - `issues` 可为空数组；当 `successRate < 95` 时必须包含至少一项问题记录。

## Derived Structures

- **DraftHistory**（列表，不单独持久化）：维持最近 N 次 `ArticleDraft` 快照，用于撤销/恢复。每条记录字段同 `ArticleDraft`，通过内存队列或 IndexedDB 历史表实现。
- **ThemeTokenSchema**：JSON Schema 定义，用于校验 `ThemePreset.tokens`。

## Data Volume & Performance

- 单个 `ArticleDraft` 预计 < 1 MB（含 HTML 快照），IndexedDB 可轻松承载 50 篇草稿。
- `CompatibilityReport` 保留最新 10 条，超过时滚动删除最旧记录。
- 自动保存间隔默认 3 秒，需 debounce 防止频繁写入。
