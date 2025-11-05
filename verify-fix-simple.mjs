/**
 * 简化版验证脚本 - 检查关键修复点
 */

import fs from 'fs'
import path from 'path'

console.log('🔍 验证主题修复...\n')

// 检查1: 验证store.ts中的默认主题ID
console.log('1. 检查 store.ts 中的默认主题设置')
const storePath = './apps/web/src/features/editor/store.ts'
const storeContent = fs.readFileSync(storePath, 'utf-8')

if (storeContent.includes("selectedThemeId: 'chinese'")) {
  console.log('  ✅ DEFAULT_SETTINGS.selectedThemeId = "chinese"')
} else if (storeContent.includes("selectedThemeId: 'default'")) {
  console.log('  ❌ DEFAULT_SETTINGS.selectedThemeId = "default" (未修复)')
} else {
  console.log('  ⚠️  未找到 selectedThemeId 设置')
}

if (storeContent.includes("themeId: 'chinese',")) {
  console.log('  ✅ buildDraft() 默认 themeId = "chinese"')
} else {
  console.log('  ❌ buildDraft() 默认 themeId 不是 "chinese"')
}

console.log()

// 检查2: 验证Chinese主题的结构化数据
console.log('2. 检查 Chinese 主题的结构化样式')
const presetsPath = './apps/web/src/themes/presets.ts'
const presetsContent = fs.readFileSync(presetsPath, 'utf-8')

const chineseChecks = [
  { key: 'id: \'chinese\'', desc: '主题ID' },
  { key: 'structured:', desc: '结构化数据' },
  { key: 'container:', desc: '容器样式' },
  { key: 'backgroundColor: \'#ffffff\'', desc: '容器背景色' },
  { key: 'padding: \'30px\'', desc: '容器内边距' },
  { key: 'headings:', desc: '标题样式' },
  { key: 'h1:', desc: 'H1样式' },
  { key: 'lists:', desc: '列表样式' },
]

chineseChecks.forEach(check => {
  if (presetsContent.includes(check.key)) {
    console.log(`  ✅ ${check.desc}`)
  } else {
    console.log(`  ❌ ${check.desc} - 未找到`)
  }
})

console.log()

// 检查3: 验证转换器实现
console.log('3. 检查内联样式转换器实现')
const converterPath = './apps/web/src/conversion/inline-style-converter.ts'
const converterContent = fs.readFileSync(converterPath, 'utf-8')

const converterChecks = [
  { key: 'function convertToInlineStyles', desc: '主转换函数' },
  { key: 'function safeApplyStyles', desc: '安全样式应用' },
  { key: 'function applyPseudoElement', desc: '伪元素处理' },
  { key: 'function processComplexListMarkers', desc: '复杂列表marker' },
  { key: 'theme.structured', desc: '结构化主题支持' },
]

converterChecks.forEach(check => {
  if (converterContent.includes(check.key)) {
    console.log(`  ✅ ${check.desc}`)
  } else {
    console.log(`  ❌ ${check.desc} - 未找到`)
  }
})

console.log()

// 检查4: 验证类型定义
console.log('4. 检查类型定义')
const typesPath = './apps/web/src/types/draft.ts'
const typesContent = fs.readFileSync(typesPath, 'utf-8')

const typeChecks = [
  { key: 'interface ThemePreset', desc: 'ThemePreset接口' },
  { key: 'structured?: ThemeComponentStyles', desc: '结构化样式字段' },
  { key: 'interface ThemeComponentStyles', desc: 'ThemeComponentStyles接口' },
  { key: 'PseudoElementConfig', desc: '伪元素配置' },
  { key: 'ListMarkerConfig', desc: '列表marker配置' },
]

typeChecks.forEach(check => {
  if (typesContent.includes(check.key)) {
    console.log(`  ✅ ${check.desc}`)
  } else {
    console.log(`  ❌ ${check.desc} - 未找到`)
  }
})

console.log()

// 检查5: 检查复制按钮实现
console.log('5. 检查复制按钮实现')
const headerPath = './apps/web/src/components/layout/HeaderBar.tsx'
try {
  const headerContent = fs.readFileSync(headerPath, 'utf-8')
  if (headerContent.includes('activeThemeId') && headerContent.includes('getThemePreset')) {
    console.log('  ✅ HeaderBar 使用 activeThemeId 获取主题')
  } else {
    console.log('  ⚠️  HeaderBar 主题获取逻辑需要检查')
  }
} catch (e) {
  console.log('  ⚠️  HeaderBar.tsx 文件读取失败')
}

console.log('\n' + '='.repeat(60))
console.log('✅ 验证完成！')
console.log('='.repeat(60))

console.log('\n📝 总结:')
console.log('如果所有检查都显示 ✅，说明主题ID修复已完成')
console.log('现在 copy 按钮应该会使用 "chinese" 主题而不是 "default"')
console.log('\n🎯 下一步建议:')
console.log('1. 启动应用: cd apps/web && npm run dev')
console.log('2. 在浏览器中测试复制功能')
console.log('3. 检查预览和实际复制效果是否一致')
