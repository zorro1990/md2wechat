import { useEditorStore } from '@/features/editor/store'
import { applyTheme } from '@/themes/manager'

interface ThemeOption {
  id: string
  name: string
  description: string
  colors: string[]
  tags: string[]
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'chinese',
    name: '中国风',
    description: '传统，古典，雅致',
    colors: ['#f7f6f2', '#a72f2f', '#333333'],
    tags: ['传统', '古典', '雅致'],
  },
  {
    id: 'bytedance',
    name: '字节风',
    description: '现代，简约，科技',
    colors: ['#f4f5f5', '#2970FF', '#1f2329'],
    tags: ['现代', '简约', '科技'],
  },
  {
    id: 'memphis',
    name: '孟菲斯',
    description: '几何，创意，活力',
    colors: ['#f7f7f7', '#118AB2', '#EF476F'],
    tags: ['几何', '创意', '活力'],
  },
  {
    id: 'renaissance',
    name: '文艺复兴',
    description: '经典，优雅，奢华',
    colors: ['#fbf5e9', '#9B2226', '#003049'],
    tags: ['经典', '优雅', '奢华'],
  },
  {
    id: 'minimalist',
    name: '现代简约',
    description: '清晰，简约，舒适',
    colors: ['#f8f9fa', '#3498db', '#2c3e50'],
    tags: ['清晰', '简约', '舒适'],
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克风',
    description: '未来，霓虹，科技',
    colors: ['#1a1a2e', '#00ffff', '#cddc39'],
    tags: ['未来', '霓虹', '科技'],
  },
]

export function SettingsPanel() {
  const appSettings = useEditorStore((state) => state.appSettings)
  const toggleScrollSync = useEditorStore((state) => state.toggleScrollSync)
  const setFontSize = useEditorStore((state) => state.setFontSize)
  const setExportBackground = useEditorStore((state) => state.setExportBackground)
  const setSelectedThemeId = useEditorStore((state) => state.setSelectedThemeId)
  const setActiveTheme = useEditorStore((state) => state.setActiveTheme)

  const handleThemeSelect = async (themeId: string) => {
    setSelectedThemeId(themeId)
    await setActiveTheme(themeId)
    applyTheme(themeId)
  }

  return (
    <>
      <section className="settings-section">
          <h3 className="settings-section__title">主题风格</h3>
          <p className="settings-section__description">选择喜欢的主题风格</p>
          <div className="theme-grid">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`theme-card ${
                  appSettings.selectedThemeId === theme.id ? 'is-selected' : ''
                }`}
                onClick={() => handleThemeSelect(theme.id)}
                aria-pressed={appSettings.selectedThemeId === theme.id}
              >
                <div className="theme-card__colors">
                  {theme.colors.slice(0, 3).map((color, index) => (
                    <div
                      key={index}
                      className="theme-card__color-indicator"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="theme-card__info">
                  <span className="theme-card__name">{theme.name}</span>
                  <span className="theme-card__description"> {theme.description} </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section__title">编辑体验</h3>
          <p className="settings-section__description">优化您的编辑体验</p>

          <div className="setting-item">
            <div className="setting-item__info">
              <label className="setting-item__label">双向滚动同步</label>
              <p className="setting-item__description">
                打开则 Markdown 与预览保持同步滚动
              </p>
            </div>
            <button
              type="button"
              className={`toggle-switch ${appSettings.scrollSync ? 'is-active' : ''}`}
              onClick={toggleScrollSync}
              aria-pressed={appSettings.scrollSync}
              aria-label="切换滚动同步"
            >
              <span className="toggle-switch__knob" />
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section__title">字体大小</h3>
          <p className="settings-section__description">选择适合的编辑字体大小</p>

          <div className="radio-card">
            <div className="radio-card__radio">
              <input
                type="radio"
                name="font-size"
                value="small"
                checked={appSettings.fontSize === 'small'}
                onChange={() => setFontSize('small')}
              />
            </div>
            <div className="radio-card__content">
              <div className="radio-card__main">
                <span className="radio-card__label">小</span>
                <span className="radio-card__title">小号字体(14px)</span>
              </div>
              <p className="radio-card__description">基础字体14px，适合精细阅读，信息密度较高</p>
            </div>
          </div>

          <div className="radio-card">
            <div className="radio-card__radio">
              <input
                type="radio"
                name="font-size"
                value="medium"
                checked={appSettings.fontSize === 'medium'}
                onChange={() => setFontSize('medium')}
              />
            </div>
            <div className="radio-card__content">
              <div className="radio-card__main">
                <span className="radio-card__label">中</span>
                <span className="radio-card__title">中号字体(15px)</span>
              </div>
              <p className="radio-card__description">推荐字体15px，平衡阅读体验与内容密度</p>
            </div>
          </div>

          <div className="radio-card">
            <div className="radio-card__radio">
              <input
                type="radio"
                name="font-size"
                value="large"
                checked={appSettings.fontSize === 'large'}
                onChange={() => setFontSize('large')}
              />
            </div>
            <div className="radio-card__content">
              <div className="radio-card__main">
                <span className="radio-card__label">大</span>
                <span className="radio-card__title">大号字体(16px)</span>
              </div>
              <p className="radio-card__description">舒适字体16px，阅读轻松，适合长时间创作</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section__title">导出配置</h3>
          <p className="settings-section__description">复制到微信时的背景样式</p>

          <div className="radio-card">
            <div className="radio-card__radio">
              <input
                type="radio"
                name="export-background"
                value="warm"
                checked={appSettings.exportBackground === 'warm'}
                onChange={() => setExportBackground('warm')}
              />
            </div>
            <div className="radio-card__content">
              <div className="radio-card__main">
                <div className="radio-card__color-swatch" style={{ backgroundColor: '#f7f6f2' }} />
                <span className="radio-card__title">温暖米色</span>
              </div>
              <p className="radio-card__description">经典微信风格，温暖舒适，阅读体验佳</p>
            </div>
          </div>

          <div className="radio-card">
            <div className="radio-card__radio">
              <input
                type="radio"
                name="export-background"
                value="grid"
                checked={appSettings.exportBackground === 'grid'}
                onChange={() => setExportBackground('grid')}
              />
            </div>
            <div className="radio-card__content">
              <div className="radio-card__main">
                <div className="radio-card__color-swatch" style={{ backgroundColor: '#ffffff', border: '1px solid #ddd' }} />
                <span className="radio-card__title">方格白底</span>
              </div>
              <p className="radio-card__description">纯净白色背景，简洁专业，适合商务内容</p>
            </div>
          </div>

          <div className="radio-card">
            <div className="radio-card__radio">
              <input
                type="radio"
                name="export-background"
                value="none"
                checked={appSettings.exportBackground === 'none'}
                onChange={() => setExportBackground('none')}
              />
            </div>
            <div className="radio-card__content">
              <div className="radio-card__main">
                <div className="radio-card__color-swatch" style={{ backgroundColor: 'transparent', border: '2px dashed #ddd' }} />
                <span className="radio-card__title">无背景</span>
              </div>
              <p className="radio-card__description">透明背景，完全适配微信默认背景色</p>
            </div>
          </div>
        </section>
    </>
  )
}
