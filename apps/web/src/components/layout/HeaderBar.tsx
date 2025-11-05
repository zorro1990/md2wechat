import { useEditorStore } from '@/features/editor/store'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { copyConvertedHTML } from '@/conversion/inline-style-converter'
import { getThemePreset } from '@/themes/presets'

// ✅ 默认主题ID常量
const DEFAULT_THEME_ID = 'chinese'

export function HeaderBar() {
  const appSettings = useEditorStore((state) => state.appSettings)
  const setThemeMode = useEditorStore((state) => state.setThemeMode)
  const toggleSettings = useEditorStore((state) => state.toggleSettings)
  const currentDraftId = useEditorStore((state) => state.currentDraftId)
  const drafts = useEditorStore((state) => state.drafts)
  const activeThemeId = useEditorStore((state) => state.activeThemeId ?? DEFAULT_THEME_ID)
  const { notify } = useFeedback()

  const handleThemeToggle = () => {
    const newMode = appSettings.themeMode === 'light' ? 'dark' : 'light'
    setThemeMode(newMode)
    notify({
      title: `已切换到${newMode === 'light' ? '浅色' : '深色'}模式`,
      variant: 'success',
    })
  }

  const handleMenuClick = () => {
    console.log('Menu clicked - future drawer implementation')
  }

  const handleSettingsClick = () => {
    toggleSettings()
  }

  const handleDownloadClick = () => {
    notify({
      title: '下载功能',
      description: '导出功能正在开发中',
      variant: 'info',
    })
  }

  const handleCopyClick = async () => {
    // 检查是否有草稿
    if (!currentDraftId) {
      notify({
        title: '暂无内容可复制',
        description: '请先创建或选择一个草稿',
        variant: 'warning',
      })
      return
    }

    const draft = currentDraftId ? drafts[currentDraftId] : null

    // 🔍 DEBUG: 记录复制操作
    console.log('📋 [DEBUG] Copy action initiated', {
      currentDraftId,
      activeThemeId,
      draftExists: !!draft,
      previewHtmlLength: draft?.previewHtml?.length || 0,
    })

    if (!draft || !draft.previewHtml) {
      notify({
        title: '暂无预览内容',
        description: '请确保草稿已渲染预览',
        variant: 'warning',
      })
      return
    }

    try {
      // 获取主题预设
      const theme = getThemePreset(activeThemeId)

      // 🔍 DEBUG: 记录主题信息
      console.log('🎨 [DEBUG] Theme info', {
        themeId: theme.id,
        hasStructured: !!theme.structured,
        hasPage: !!theme.structured?.page,
      })

      // 转换并复制HTML
      const result = await copyConvertedHTML(draft.previewHtml, theme)

      if (result.success) {
        notify({
          title: '✅ 转换并复制成功',
          description: '已复制带内联样式的HTML，可直接粘贴到微信公众号后台',
          variant: 'success',
          dismissAfterMs: 5000,
        })
      } else {
        notify({
          title: '❌ 复制失败',
          description: result.message,
          variant: 'error',
        })
      }
    } catch (error) {
      console.error('Copy error:', error)
      notify({
        title: '❌ 复制失败',
        description: error instanceof Error ? error.message : '请重试',
        variant: 'error',
      })
    }
  }

  return (
    <header className="header-bar">
      <div className="header-bar__content">
        <div className="header-bar__brand">
          <svg
            className="header-bar__logo"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="#07C160" />
            <path
              d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8ZM16 18C13.791 18 12 16.209 12 14C12 11.791 13.791 10 16 10C18.209 10 20 11.791 20 14C20 16.209 18.209 18 16 18Z"
              fill="white"
            />
            <path
              d="M16 12C14.895 12 14 12.895 14 14C14 15.105 14.895 16 16 16C17.105 16 18 15.105 18 14C18 12.895 17.105 12 16 12Z"
              fill="white"
            />
          </svg>
          <h1 className="header-bar__title">md2wechat</h1>
        </div>

        <div className="header-bar__actions">
          <button
            type="button"
            className="header-bar__button"
            onClick={handleMenuClick}
            aria-label="菜单"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 5H17M3 10H17M3 15H17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="header-bar__button-text">Menu</span>
          </button>

          <button
            type="button"
            className="header-bar__button"
            onClick={handleThemeToggle}
            aria-label={`切换到${appSettings.themeMode === 'light' ? '深色' : '浅色'}模式`}
          >
            {appSettings.themeMode === 'light' ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2V3M10 17V18M4.22 4.22L5.64 5.64M14.36 14.36L15.78 15.78M2 10H3M17 10H18M4.22 15.78L5.64 14.36M14.36 5.64L15.78 4.22M12 7C12 9.2091 10.2091 11 8 11C5.79086 11 4 9.2091 4 7C4 4.79086 5.79086 3 8 3C10.2091 3 12 4.79086 12 7ZM16 7C16 9.2091 14.2091 11 12 11C9.79086 11 8 9.2091 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.293 13.293C16.734 14.492 15.777 15.549 14.564 16.329C13.351 17.108 11.936 17.569 10.487 17.647C9.038 17.725 7.614 17.416 6.396 16.758C5.177 16.101 4.222 15.124 3.641 13.955C3.06 12.785 2.875 11.476 3.105 10.21C3.335 8.944 3.97 7.78 4.93 6.82C5.89 5.86 7.054 5.225 8.32 4.995C9.586 4.765 10.895 4.95 12.065 5.531C13.234 6.112 14.211 7.067 14.868 8.286C15.526 9.504 15.835 10.928 15.757 12.377C15.679 13.826 15.218 15.241 14.439 16.454C13.659 17.666 12.602 18.624 11.403 19.182"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <span className="header-bar__button-text">
              {appSettings.themeMode === 'light' ? 'Dark' : 'Light'}
            </span>
          </button>

          <button
            type="button"
            className="header-bar__button"
            onClick={handleSettingsClick}
            aria-label="设置"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 6C8.89543 6 8 6.89543 8 8C8 9.10457 8.89543 10 10 10C11.1046 10 12 9.10457 12 8C12 6.89543 11.1046 6 10 6Z"
                fill="currentColor"
              />
              <path
                d="M8.5 14C8.5 13.1716 9.17157 12.5 10 12.5C10.8284 12.5 11.5 13.1716 11.5 14V15C11.5 15.8284 10.8284 16.5 10 16.5C9.17157 16.5 8.5 15.8284 8.5 15V14Z"
                fill="currentColor"
              />
              <path
                d="M15.5 12C16.3284 12 17 12.6716 17 13.5V14.5C17 15.3284 16.3284 16 15.5 16C14.6716 16 14 15.3284 14 14.5V13.5C14 12.6716 14.6716 12 15.5 12Z"
                fill="currentColor"
              />
              <path
                d="M4.5 12C5.32843 12 6 12.6716 6 13.5V14.5C6 15.3284 5.32843 16 4.5 16C3.67157 16 3 15.3284 3 14.5V13.5C3 12.6716 3.67157 12 4.5 12Z"
                fill="currentColor"
              />
            </svg>
            <span className="header-bar__button-text">Settings</span>
          </button>

          <button
            type="button"
            className="header-bar__button"
            onClick={handleDownloadClick}
            aria-label="下载"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 14V4M10 14L6 10M10 14L14 10M4 16H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="header-bar__button-text">Download</span>
          </button>

          <button
            type="button"
            className="header-bar__button"
            onClick={handleCopyClick}
            aria-label="复制"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
              <rect x="6" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="header-bar__button-text">Copy</span>
          </button>
        </div>
      </div>
    </header>
  )
}
