import { useState, useRef } from 'react'

interface EditorActionsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>
  value: string
  onChange: (value: string) => void
}

export function EditorActions({ textareaRef, value, onChange }: EditorActionsProps) {
  const [isInsertingLink, setIsInsertingLink] = useState(false)

  const insertLink = () => {
    setIsInsertingLink(true)
    const text = window.prompt('请输入链接文本（显示文字）')
    if (text === null) {
      setIsInsertingLink(false)
      return
    }

    const url = window.prompt('请输入链接地址（URL）')
    if (url === null) {
      setIsInsertingLink(false)
      return
    }

    if (!url) {
      setIsInsertingLink(false)
      return
    }

    const textarea = textareaRef.current
    if (!textarea) {
      setIsInsertingLink(false)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || text
    const linkText = selectedText || text
    const link = `[${linkText}](${url})`

    const newValue = value.substring(0, start) + link + value.substring(end)
    onChange(newValue)

    // 重新设置光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + link.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)

    setIsInsertingLink(false)
  }

  return (
    <div className="editor-actions">
      <button
        type="button"
        className="editor-actions__button"
        onClick={insertLink}
        disabled={isInsertingLink}
        title="插入链接"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
        </svg>
        <span>插入链接</span>
      </button>
    </div>
  )
}
