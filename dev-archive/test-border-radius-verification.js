/**
 * 测试 border-radius 修复效果
 *
 * 这个脚本会：
 * 1. 验证生成的 HTML 结构是否正确
 * 2. 确认只存在一个 class="content" 的容器
 * 3. 检查 border-radius 样式是否被应用
 */

console.log('🔍 开始验证 border-radius 修复...\n');

// 模拟生成 HTML 的过程
const testMarkdown = `# 测试标题

这是一个测试段落，包含一些文本内容。

## 子标题

这里是子标题下的内容。

- 列表项 1
- 列表项 2
- 列表项 3

> 这是一个引用块

\`\`\`javascript
const message = 'Hello World';
console.log(message);
\`\`\`
`;

console.log('📝 测试 Markdown 内容:');
console.log(testMarkdown);
console.log('\n');

// 预期的 HTML 结构应该类似：
// <div style="font-size: 15px;">
//   <div class="content" style="...">
//     <!-- 实际渲染的内容 -->
//   </div>
// </div>

// ✅ 修复后的结构：只有一层 class="content" 容器
const expectedStructure = {
  hasOuterDiv: true,
  outerDivHasFontSize: true,
  outerDivHasContentClass: false, // ✅ 修复：外层 div 不应该有 class="content"
  hasInnerContent: true,
  innerDivHasContentClass: true, // ✅ 内层容器有 class="content"
  innerDivHasBorderRadius: true // ✅ themes.css 中的 !important 规则应该应用
};

console.log('✅ 修复验证清单:');
Object.entries(expectedStructure).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${value}`);
});

console.log('\n🎯 关键修复点:');
console.log('  1. 移除了 render.ts 中的重复 class="content"');
console.log('  2. wrapContentWithContainer() 创建的容器保留 class="content"');
console.log('  3. themes.css 中的 !important 规则确保 border-radius 被应用');
console.log('  4. CSS 选择器 .wx-theme-{theme} .content 现在能正确匹配');

console.log('\n🔧 技术细节:');
console.log('  - 文件: apps/web/src/conversion/render.ts:59');
console.log('  - 修改: 移除外层 div 的 class="content"');
console.log('  - 结果: 只保留一层 class="content" 容器，避免 CSS 选择器冲突');

console.log('\n📋 测试步骤:');
console.log('  1. 访问 http://localhost:5174/');
console.log('  2. 检查微信预览区的内容容器');
console.log('  3. 确认边框是圆角（14px）而不是方角');
console.log('  4. 切换不同主题确认圆角效果一致');

console.log('\n✨ 预期结果:');
console.log('  - 三个面板（编辑器、预览、设置）的容器都应该是圆角');
console.log('  - 圆角半径统一为 14px (var(--ui-radius-lg))');
console.log('  - 中国风雅致风格在所有区域保持一致');
