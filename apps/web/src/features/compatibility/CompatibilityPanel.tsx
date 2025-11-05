import { useMemo, useState } from 'react'

import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { useEditorStore } from '@/features/editor/store'
import { evaluateCompatibility } from '@/features/compatibility/evaluator'

export function CompatibilityPanel() {
  const { notify } = useFeedback()
  const currentDraftId = useEditorStore((state) => state.currentDraftId)
  const drafts = useEditorStore((state) => state.drafts)
  const activeThemeId = useEditorStore((state) => state.activeThemeId ?? 'default')
  const recordCompatibility = useEditorStore((state) => state.recordCompatibility)
  const listReports = useEditorStore((state) => state.listCompatibilityReports)
  const [isChecking, setIsChecking] = useState(false)

  const draft = currentDraftId ? drafts[currentDraftId] : null
  const reports = useMemo(
    () => (currentDraftId ? listReports(currentDraftId) : []),
    [currentDraftId, listReports],
  )
  const latest = reports[0]

  const handleRunCheck = async () => {
    if (!draft) {
      return
    }
    setIsChecking(true)
    try {
      const report = await evaluateCompatibility(draft, { themeId: activeThemeId })
      await recordCompatibility(report)
    } catch (error) {
      // 静默模式 - 不显示错误通知
    } finally {
      setIsChecking(false)
    }
  }

  const handleExportReport = () => {
    if (!latest) {
      notify({ title: '暂无报告可导出', variant: 'warning' })
      return
    }
    const blob = new Blob([JSON.stringify(latest, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compat-report-${latest.draftId}-${latest.testedAt}.json`
    link.click()
    URL.revokeObjectURL(url)
    notify({ title: '报告已导出', description: '可分享给团队进行复核', variant: 'success' })
  }

  return (
    <section className="compat-panel">
      <header className="compat-panel__header">
        <div>
          <span className="compat-panel__eyebrow">微信兼容性</span>
          <h2 className="compat-panel__title">
            {latest ? `最近一次：${latest.successRate}%` : '尚未执行检查'}
          </h2>
        </div>
        <div className="compat-panel__header-actions">
          <button
            type="button"
            className="compat-panel__action"
            onClick={handleRunCheck}
            disabled={isChecking}
          >
            {isChecking ? '检查中…' : '运行兼容性检查'}
          </button>
          {latest ? (
            <button
              type="button"
              className="compat-panel__action compat-panel__action--ghost"
              onClick={handleExportReport}
              disabled={isChecking}
            >
              导出最新报告
            </button>
          ) : null}
        </div>
      </header>
      <div className="compat-panel__body">
        {reports.length === 0 ? (
          <p className="compat-panel__empty">
            尚未生成报告。建议在复制前执行检查，确保粘贴正确率 ≥95%。
          </p>
        ) : (
          <ul className="compat-panel__reports" aria-label="兼容性报告历史">
            {reports.slice(0, 3).map((report) => (
              <li key={report.id} className="compat-panel__report">
                <div className="compat-panel__report-summary">
                  <span className="compat-panel__report-score">{report.successRate}%</span>
                  <span className="compat-panel__report-time">
                    {new Date(report.testedAt).toLocaleString()}
                  </span>
                </div>
                {report.issues.length === 0 ? (
                  <p className="compat-panel__report-text">
                    未发现风险，可直接粘贴到公众号后台。
                  </p>
                ) : (
                  <ul className="compat-panel__issues">
                    {report.issues.slice(0, 3).map((issue) => (
                      <li key={issue.description} className={`compat-panel__issue is-${issue.severity}`}>
                        <span className="compat-panel__issue-type">{formatIssueType(issue.type)}</span>
                        <span>{issue.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {report.recommendedActions && report.recommendedActions.length > 0 ? (
                  <div className="compat-panel__recommendations">
                    <span className="compat-panel__recommendations-title">建议优化</span>
                    <ul className="compat-panel__recommendations-list">
                      {report.recommendedActions.slice(0, 3).map((action) => (
                        <li key={action} className="compat-panel__recommendation-item">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function formatIssueType(type: string): string {
  switch (type) {
    case 'link':
      return '链接'
    case 'style':
      return '样式'
    case 'media':
      return '多媒体'
    default:
      return '其他'
  }
}
