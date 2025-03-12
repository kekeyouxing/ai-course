"use client"

import React, { useState, useCallback, useMemo, useImperativeHandle } from "react"
import { createEditor, Descendant, Editor, Transforms, Text, Element as SlateElement, BaseEditor } from "slate"
import { Slate, Editable, withReact, ReactEditor } from "slate-react"
import { withHistory, HistoryEditor } from "slate-history"

interface CustomEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// 自定义元素类型
type CustomElement = {
  type: 'paragraph' | 'time-tag'
  seconds?: number
  children: CustomText[]
}

type CustomText = {
  text: string
}

// Fix the type declarations to avoid circular references
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}

// 序列化函数 - 将 Slate 内容转换为纯文本
const serialize = (nodes: Descendant[]): string => {
  return nodes.map(node => {
    if (Editor.isEditor(node)) {
      return serialize(node.children)
    }

    if (SlateElement.isElement(node)) {
      if (node.type === 'time-tag') {
        return `<#${node.seconds}#>`
      }
      return serialize(node.children)
    }

    if (Text.isText(node)) {
      return node.text
    }

    return ''
  }).join('')
}

// 反序列化函数 - 将纯文本转换为 Slate 内容
const deserialize = (text: string): Descendant[] => {
  const tagRegex = /<#(\d+)#>/g
  const nodes: Descendant[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(text)) !== null) {
    // 添加标记前的文本
    if (match.index > lastIndex) {
      nodes.push({
        type: 'paragraph',
        children: [{ text: text.substring(lastIndex, match.index) }]
      })
    }

    // 添加时间标记
    nodes.push({
      type: 'time-tag',
      seconds: parseInt(match[1]),
      children: [{ text: '' }]
    })

    lastIndex = match.index + match[0].length
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    nodes.push({
      type: 'paragraph',
      children: [{ text: text.substring(lastIndex) }]
    })
  }

  // 如果没有内容，添加一个空段落
  if (nodes.length === 0) {
    nodes.push({
      type: 'paragraph',
      children: [{ text: '' }]
    })
  }

  return nodes
}

// 自定义渲染元素
const Element = (props: any) => {
  const { attributes, children, element } = props

  switch (element.type) {
    case 'time-tag':
      return (
        <span
          {...attributes}
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium mx-0.5"
          contentEditable={false}
        >
          <span className="mr-1">暂停</span>
          <span className="time-value">{element.seconds}</span>
          <span className="ml-1">秒</span>
          {children}
        </span>
      )
    default:
      return <span {...attributes}>{children}</span>
  }
}

// 主组件
const CustomEditor = React.forwardRef<
  { insertTimeTag: (seconds: number) => void },
  CustomEditorProps
>((props, ref) => {
  const {
    value,
    onChange,
    placeholder = "在此输入您的脚本...",
    className = ""
  } = props

  // 创建编辑器实例
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  
  // 将外部纯文本值转换为 Slate 内部格式
  const [internalValue, setInternalValue] = useState<Descendant[]>(() => 
    deserialize(value || '')
  )

  // 处理内容变化
  const handleChange = useCallback((newValue: Descendant[]) => {
    setInternalValue(newValue)
    const newText = serialize(newValue)
    onChange(newText)
  }, [onChange])

  // 插入时间标签
  const insertTimeTag = useCallback((seconds: number) => {
    const timeTag: CustomElement = {
      type: 'time-tag',
      seconds,
      children: [{ text: '' }]
    }

    Transforms.insertNodes(editor, timeTag)
    // 移动光标到标签后面
    Transforms.move(editor, { distance: 1 })
  }, [editor])

  // 暴露方法给父组件
  useImperativeHandle(
    ref,
    () => ({
      insertTimeTag
    }),
    [insertTimeTag]
  )

  // 当外部 value 变化时更新内部值
  React.useEffect(() => {
    const newInternalValue = deserialize(value || '')
    // 只有当序列化后的值不同时才更新，避免光标重置
    if (serialize(internalValue) !== value) {
      setInternalValue(newInternalValue)
    }
  }, [value])

  // In the return statement, change the Slate component props
  return (
    <div className={`p-2 outline-none text-base leading-relaxed overflow-auto ${className}`}>
      <Slate editor={editor} initialValue={internalValue} onChange={handleChange}>
        <Editable
          placeholder={placeholder}
          renderElement={Element}
          className="outline-none min-h-full"
        />
      </Slate>
    </div>
  )
})

export default CustomEditor