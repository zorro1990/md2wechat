/**
 * 测试标点符号换行修复
 * 验证 U+2060 是否正确插入
 */

const testHTML = `
<ul>
  <li><strong>实时预览</strong>：左侧编辑，右侧即时查看排版效果。</li>
  <li><strong>一键复制</strong>：轻松复制富文本格式，直接粘贴到公众号后台。</li>
  <li><strong><a href="/help">📖 使用帮助</a></strong> - 详细的功能说明和使用技巧</li>
</ul>
`

/**
 * 防止微信后台在中文标点前换行
 */
async function preventWechatPunctuationBreaks(html) {
  try {
    const WORD_JOINER = '\u2060'
    const PUNCTS = new Set(['：', '，', '。', '！', '？', '；', '、', '）', '】', '》', '」', '』', '-', '－', '—', '–'])

    // 使用 JSDOM 模拟浏览器环境
    const { JSDOM } = await import('jsdom')
    const dom = new JSDOM(html)
    const doc = dom.window.document

    // 遍历所有文本节点
    const walker = doc.createTreeWalker(doc.body, 4) // NodeFilter.SHOW_TEXT = 4
    const textNodes = []
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode)
    }

    console.log(`\n📊 找到 ${textNodes.length} 个文本节点\n`)

    let insertCount = 0
    let nodeWithPunctCount = 0

    for (const t of textNodes) {
      if (!t.nodeValue) continue

      const originalValue = t.nodeValue
      console.log(`\n🔍 处理文本节点: "${originalValue}"`)

      // 1) 同一文本节点内部：在"字/词 + 标点"之间插入 WORD_JOINER
      const re = /([\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AFA-Za-z0-9])([：，。！？；、）】》」』])/g
      let val = t.nodeValue.replace(re, (match, p1, p2) => {
        insertCount++
        console.log(`  ✅ 在文本内部插入 U+2060: "${p1}" + "${p2}"`)
        return `${p1}${WORD_JOINER}${p2}`
      })

      // 2) 如果文本以标点开头，在文本开头添加 WORD_JOINER
      if (val.length > 0 && PUNCTS.has(val[0])) {
        nodeWithPunctCount++
        val = WORD_JOINER + val
        insertCount++
        console.log(`  ✅ 在文本开头添加 U+2060: "${val.substring(0, 20)}"`)
      }

      // 3) 🔧 新增：如果文本以空格开头，检查第一个非空格字符
      const trimmed = val.trimStart()
      const leadingSpaces = val.length - trimmed.length
      if (leadingSpaces > 0 && trimmed.length > 0 && PUNCTS.has(trimmed[0])) {
        nodeWithPunctCount++
        // 在空格前插入 U+2060
        val = WORD_JOINER + val
        insertCount++
        console.log(`  ✅ 在空格前添加 U+2060: "${val.substring(0, 20)}"`)
      }

      if (originalValue !== val) {
        console.log(`  📝 文本节点变化:`)
        console.log(`     before: "${originalValue}"`)
        console.log(`     after:  "${val}"`)
        console.log(`     包含 U+2060: ${val.includes('\u2060')}`)
      }

      t.nodeValue = val
    }

    console.log(`\n📊 统计:`, {
      totalTextNodes: textNodes.length,
      insertCount,
      nodeWithPunctCount
    })

    const result = doc.body.innerHTML
    
    // 检查结果
    const hasWordJoiner = result.includes('\u2060')
    const wordJoinerCount = (result.match(/\u2060/g) || []).length
    
    console.log(`\n✅ 转换完成:`)
    console.log(`   包含 U+2060: ${hasWordJoiner}`)
    console.log(`   U+2060 数量: ${wordJoinerCount}`)
    
    // 显示包含冒号的部分
    const colonMatches = result.match(/.{0,20}[：].{0,20}/g)
    if (colonMatches) {
      console.log(`\n🔍 冒号周围的内容:`)
      colonMatches.forEach((match, i) => {
        console.log(`   ${i + 1}. "${match}"`)
      })
    }

    // 显示包含破折号的部分
    const dashMatches = result.match(/.{0,20}[-－—–].{0,20}/g)
    if (dashMatches) {
      console.log(`\n🔍 破折号周围的内容:`)
      dashMatches.forEach((match, i) => {
        console.log(`   ${i + 1}. "${match}"`)
      })
    }

    return result
  } catch (e) {
    console.error('❌ 转换失败:', e)
    return html
  }
}

// 运行测试
console.log('🚀 开始测试...\n')
console.log('📄 原始 HTML:')
console.log(testHTML)

const result = await preventWechatPunctuationBreaks(testHTML)

console.log('\n\n📄 转换后的 HTML:')
console.log(result)

