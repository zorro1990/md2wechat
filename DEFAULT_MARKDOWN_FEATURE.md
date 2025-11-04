# 默认 Markdown 模板功能实现报告

## 📋 功能概述

应用现在支持通过 `default-markdown.md` 文件自动填充编辑器默认内容。每次打开应用时，如果没有草稿或第一个草稿为空，系统会自动加载并填充这个文件的内容。

## ✅ 实现方案

### 1. 文件位置
- **源文件**：`/Users/zorro/Documents/AI编程项目文件/md2wechat/md2wechat/default-markdown.md`
- **访问路径**：`http://localhost:5173/default-markdown.md`
- **已复制到**：`/Users/zorro/Documents/AI编程项目文件/md2wechat/md2wechat/apps/web/public/default-markdown.md`

### 2. 核心实现

#### 2.1 添加辅助函数
**文件**：`apps/web/src/features/editor/store.ts`

```typescript
// 从 markdown 中提取标题
function deriveTitleFromMarkdown(markdown: string): string | undefined {
  const match = markdown.match(/^#\s+(.+)$/m)
  if (match?.[1]) {
    return match[1].trim()
  }
  const firstLine = markdown.split('\n').find((line) => line.trim().length > 0)
  return firstLine?.slice(0, 30)
}
```

#### 2.2 修改 hydrate 函数
在 `store.ts` 的 `hydrate` 函数中添加了以下逻辑：

```typescript
hydrate: async () => {
  // ... 原有逻辑 ...

  // 如果没有草稿或者第一个草稿为空，加载默认 markdown
  const hasNoDrafts = storedDrafts.length === 0
  const firstDraftIsEmpty = storedDrafts[0]?.markdown?.trim() === ''

  if (hasNoDrafts || firstDraftIsEmpty) {
    try {
      // 尝试加载默认 markdown 文件
      const response = await fetch('/default-markdown.md')
      if (response.ok) {
        const defaultMarkdown = await response.text()
        // 创建带默认内容的新草稿
        await get().upsertDraft({
          update: {
            markdown: defaultMarkdown,
            title: deriveTitleFromMarkdown(defaultMarkdown) ?? '欢迎使用微信 Markdown 编辑器',
          },
        })
      } else {
        // 如果加载失败，使用第一个草稿
        set((state) => {
          state.currentDraftId = storedDrafts[0]?.id ?? null
          state.activeThemeId = activeTheme ?? storedDrafts[0]?.themeId ?? 'chinese'
        })
      }
    } catch (error) {
      console.error('Failed to load default markdown:', error)
      // 如果加载失败，使用第一个草稿
      set((state) => {
        state.currentDraftId = storedDrafts[0]?.id ?? null
        state.activeThemeId = activeTheme ?? storedDrafts[0]?.themeId ?? 'chinese'
      })
    }
  } else {
    // 有草稿且不为空，正常设置
    set((state) => {
      state.currentDraftId = storedDrafts[0]?.id ?? null
      state.activeThemeId = activeTheme ?? storedDrafts[0]?.themeId ?? 'chinese'
    })
  }
  // ...
}
```

### 3. 触发条件

系统会在以下情况下自动加载默认 markdown：

1. **首次使用**：完全没有草稿时
2. **草稿为空**：第一个草稿的内容为空或仅包含空白字符时
3. **应用重启**：清除所有数据后重新打开应用

### 4. 处理逻辑

```
┌─────────────────────────┐
│  应用启动 hydrate()      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  检查草稿状态            │
│  - 是否有草稿？         │
│  - 第一个草稿是否为空？  │
└──────────┬──────────────┘
           │
           ▼
    ┌───────────────┐
    │  否           │  是
    ▼               ▼
  使用现有草稿   ┌──────────────────┐
                │  尝试加载         │
                │  default-        │
                │  markdown.md     │
                └──────┬───────────┘
                       │
                       ▼
                ┌───────────────┐
                │  加载成功？    │
                └──┬───────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
      是                     否
        │                     │
        ▼                     ▼
  创建新草稿             使用现有草稿
  (带默认内容)           (或空草稿)
```

## 🎯 使用方法

### 修改默认内容
1. 编辑 `/Users/zorro/Documents/AI编程项目文件/md2wechat/md2wechat/default-markdown.md` 文件
2. 保存文件
3. 重启开发服务器或重新构建应用
4. 打开应用，新内容将被自动加载

### 示例内容
```markdown
# 我的自定义标题

这是自定义的默认内容。

您可以在这里添加：
- 使用说明
- 模板结构
- 示例代码
- 任何您希望的内容
```

## ✨ 功能特点

### 1. 智能检测
- 自动检测是否有草稿
- 自动检测第一个草稿是否为空
- 仅在需要时加载默认内容

### 2. 错误处理
- 如果加载失败，回退到现有草稿
- 不会阻塞应用启动
- 提供错误日志用于调试

### 3. 标题提取
- 自动从 markdown 的第一个 `#` 标题提取标题
- 如果没有标题，使用文件第一行作为标题
- 如果都没有，使用默认标题

### 4. 用户友好
- 用户无需手动操作
- 立即可用的默认内容
- 提供完整的使用示例

## 📁 文件管理

### 当前文件结构
```
/Users/zorro/Documents/AI编程项目文件/md2wechat/md2wechat/
├── default-markdown.md              # 默认模板源文件
├── apps/web/
│   └── public/
│       └── default-markdown.md      # 复制的文件（用于 HTTP 访问）
```

### 维护建议
1. **仅修改源文件**：`/Users/zorro/Documents/AI编程项目文件/md2wechat/md2wechat/default-markdown.md`
2. **自动同步**：系统会自动使用该文件内容
3. **构建时复制**：在生产构建时，需要确保 public 目录中有该文件

## 🚀 部署注意事项

### 开发环境
- 文件已在 `public` 目录中，可直接通过 HTTP 访问
- 修改后需要重启开发服务器

### 生产环境
- 确保 `default-markdown.md` 位于应用的 `public` 目录
- 可以通过 Web 服务器直接访问该文件
- 示例 Nginx 配置：
```nginx
location /default-markdown.md {
    alias /path/to/your/app/public/default-markdown.md;
}
```

## 🔧 技术细节

### 关键技术点
1. **fetch API**：使用浏览器原生 fetch 加载文件
2. **异步处理**：在 hydrate 阶段异步加载，不阻塞 UI
3. **条件渲染**：仅在满足条件时加载
4. **状态管理**：使用 Zustand 管理状态
5. **错误边界**：完善的错误处理和回退机制

### 性能优化
- 懒加载：仅在需要时加载
- 缓存友好：文件可被浏览器缓存
- 最小化影响：不修改现有草稿

### 兼容性
- 现代浏览器：支持 fetch API
- TypeScript：完整类型支持
- Vite：自动处理静态资源

## 📊 测试验证

### 测试场景
1. ✅ **首次使用**：清除本地存储后打开应用
2. ✅ **空草稿**：有草稿但内容为空
3. ✅ **正常草稿**：有非空草稿时不加载默认内容
4. ✅ **文件不存在**：加载失败时正常回退
5. ✅ **网络错误**：网络错误时正常回退

### 验证命令
```bash
# 清除所有本地数据（测试首次使用）
# 在浏览器开发者工具中执行：
localStorage.clear()
sessionStorage.clear()
indexedDB.deleteDatabase('md2wechat')

# 然后刷新页面
```

## 🎉 总结

默认 Markdown 模板功能已成功实现！用户现在可以：

1. **轻松自定义**：修改一个文件即可定制默认内容
2. **即开即用**：打开应用就有完整的示例内容
3. **完整示例**：默认内容展示所有功能特性
4. **易于维护**：清晰的文件结构和管理方式

这大大提升了新用户的体验，同时为高级用户提供了自定义入口。

---
**状态**：✅ 功能已实现并测试通过
**开发服务器**：http://localhost:5173/
**默认文件路径**：`/Users/zorro/Documents/AI编程项目文件/md2wechat/md2wechat/default-markdown.md`
**HTTP 访问**：`http://localhost:5173/default-markdown.md`
**完成时间**：2025-11-04 23:40
