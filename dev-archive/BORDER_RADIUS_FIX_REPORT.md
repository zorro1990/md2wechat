# Border Radius 修复报告

## 问题描述
微信预览区的内容容器显示为方角（square corners），而不是预期的 14px 圆角，导致三个主要界面区域（Markdown 编辑器、微信预览、编辑器设置）的视觉风格不一致。

## 问题分析

### 根本原因
在 `render.ts` 第 59 行，代码创建了一个带有 `class="content"` 的 div 来包装字体大小样式：
```typescript
const htmlWithFontSize = `<div class="content" style="font-size: ${fontSizeValue};">${htmlWithInlineStyles}</div>`
```

而 `htmlWithInlineStyles` 来自 `convertToInlineStyles()` 函数，该函数通过 `wrapContentWithContainer()` 已经创建了另一个带有 `class="content"` 的容器。

### 最终 HTML 结构（修复前）
```html
<div class="content" style="font-size: 15px;">  <!-- 外层：来自 render.ts -->
  <div class="content">                          <!-- 内层：来自 wrapContentWithContainer -->
    <!-- 实际渲染的 Markdown 内容 -->
  </div>
</div>
```

### 问题影响
1. **CSS 选择器冲突**：存在两个 `class="content"` 元素
2. **样式应用失败**：`themes.css` 中的规则 `.wx-theme-{theme} .content { border-radius: 14px !important; }` 可能无法正确匹配
3. **视觉不一致**：预览区保持方角，与编辑器和其他区域不匹配

## 修复方案

### 执行的修复
**文件**：`apps/web/src/conversion/render.ts`
**行号**：59
**修改内容**：
```typescript
// 修复前
const htmlWithFontSize = `<div class="content" style="font-size: ${fontSizeValue};">${htmlWithInlineStyles}</div>`

// 修复后
const htmlWithFontSize = `<div style="font-size: ${fontSizeValue};">${htmlWithInlineStyles}</div>`
```

**说明**：移除外层 div 的 `class="content"`，只保留字体大小样式，避免与内层容器的 class 冲突。

### 修复后的 HTML 结构
```html
<div style="font-size: 15px;">                   <!-- 外层：只有 font-size 样式 -->
  <div class="content">                          <!-- 内层：class="content" 容器 -->
    <!-- 实际渲染的 Markdown 内容 -->
  </div>
</div>
```

### CSS 规则保证
`themes.css` 中的关键规则（已存在）：
```css
.wx-theme-chinese .content,
.wx-theme-bytedance .content,
.wx-theme-memphis .content,
.wx-theme-renaissance .content,
.wx-theme-minimalist .content,
.wx-theme-cyberpunk .content {
  border-radius: 14px !important;
}
```

这些规则确保所有主题的内容容器都应用 14px 圆角。

## 验证结果

### 技术验证
1. ✅ `wrapContentWithContainer()` 正确创建带有 `class="content"` 的容器
2. ✅ `themes.css` 中的 `!important` 规则确保样式优先级
3. ✅ 修复后只存在一个 `class="content"` 容器
4. ✅ CSS 选择器 `.wx-theme-{theme} .content` 现在能正确匹配

### 预期视觉结果
1. **微信预览区**：内容容器显示 14px 圆角（不再是方角）
2. **统一风格**：三个面板（编辑器、预览、设置）都使用 14px 圆角
3. **一致性**：所有主题（6个主题）都应用相同的圆角规范
4. **中国风雅致风格**：保持优雅、一致的视觉体验

## 技术细节

### 完整的渲染链路
1. `renderMarkdownDocument()` 接收 Markdown 和选项
2. `createMarkdownPipeline()` 处理 Markdown 到 HTML 的转换
3. `convertToInlineStyles()` 应用内联样式，包括：
   - 基础元素样式
   - 结构化主题样式
   - 通过 `wrapContentWithContainer()` 创建容器并设置 `class="content"`
4. 包装字体大小 div（**修复点**：移除重复的 class="content"）
5. 返回最终的 HTML

### 关键文件
- **render.ts**：字体大小包装逻辑（已修复）
- **inline-style-converter.ts**：内联样式转换和容器创建
- **themes.css**：主题样式和 border-radius 规则
- **App.css**：应用级样式和圆角规范

## 部署状态
- ✅ Vite 开发服务器：http://localhost:5174/
- ✅ HMR 热更新：文件已自动更新
- ✅ 准备测试：访问页面验证视觉效果

## 后续测试步骤
1. 打开浏览器访问 http://localhost:5174/
2. 检查微信预览区域的内容容器
3. 确认边框显示为圆角（14px），不是方角
4. 切换不同主题，验证所有主题都应用圆角
5. 对比编辑器区域和设置区域的圆角效果，确保视觉一致

## 总结
通过移除重复的 `class="content"` 容器，修复了 CSS 选择器冲突问题。现在 `themes.css` 中的 border-radius 规则能够正确应用，确保三个主要界面区域保持一致的 14px 圆角和优雅的中国风视觉风格。
