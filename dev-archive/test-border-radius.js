// 测试生成的 HTML 中内容容器的 class 属性和样式
async function testRenderedHTML() {
  const testMarkdown = `# 测试标题

这是一个测试段落。

- 列表项 1
- 列表项 2
- 列表项 3
`;

  try {
    console.log('🔍 开始测试渲染 HTML...\n');
    console.log('Markdown 输入:');
    console.log(testMarkdown);
    console.log('\n');

    const response = await fetch('http://localhost:5174/api/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        markdown: testMarkdown,
        themeId: 'chinese',
        options: {
          enableFootnoteLinks: true,
          fontSize: 'medium'
        }
      }),
    });

    if (!response.ok) {
      console.log('⚠️ API 端点不存在，使用替代方法...\n');
      // 让我们检查页面上实际渲染的内容
      return;
    }

    const result = await response.json();
    console.log('📤 渲染结果 HTML:');
    console.log(result.html);
    console.log('\n');

    // 检查是否包含 .content 类
    if (result.html.includes('class="content"')) {
      console.log('✅ HTML 中包含 class="content"');
    } else {
      console.log('❌ HTML 中不包含 class="content"');
    }

    // 检查是否有 border-radius 样式
    if (result.html.includes('border-radius')) {
      console.log('✅ HTML 中包含 border-radius 样式');
    } else {
      console.log('❌ HTML 中不包含 border-radius 样式');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testRenderedHTML();
