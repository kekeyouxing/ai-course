"use client"

import React, { useState, useCallback, useMemo, useImperativeHandle } from "react"
import { createEditor, Descendant, Editor, Transforms, Text, Element as SlateElement, BaseEditor, Range } from "slate"
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
  type: 'paragraph' | 'time-tag' | 'animation-tag'
  seconds?: number
  animation?: string
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
      if (node.type === 'animation-tag') {
        return `<@animation@>`  // 简化为固定标记
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
  const timeTagRegex = /<#(\d+)#>/g
  const animationTagRegex = /<@animation@>/g  // 简化为固定标记
  const nodes: Descendant[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // 处理所有标记
  const allMatches: {type: string, index: number, length: number, value?: number}[] = []
  
  // 查找时间标记
  while ((match = timeTagRegex.exec(text)) !== null) {
    allMatches.push({
      type: 'time-tag',
      index: match.index,
      length: match[0].length,
      value: parseInt(match[1])
    })
  }
  
  // 查找动画标记
  while ((match = animationTagRegex.exec(text)) !== null) {
    allMatches.push({
      type: 'animation-tag',
      index: match.index,
      length: match[0].length
    })
  }
  
  // 按索引排序
  allMatches.sort((a, b) => a.index - b.index)
  
  // 处理所有标记
  for (const match of allMatches) {
    // 添加标记前的文本
    if (match.index > lastIndex) {
      nodes.push({
        type: 'paragraph',
        children: [{ text: text.substring(lastIndex, match.index) }]
      })
    }

    // 添加标记
    if (match.type === 'time-tag') {
      nodes.push({
        type: 'time-tag',
        seconds: match.value,
        children: [{ text: '' }]
      })
    } else if (match.type === 'animation-tag') {
      nodes.push({
        type: 'animation-tag',
        animation: '',  // 不再需要存储动画类型
        children: [{ text: '' }]
      })
    }

    lastIndex = match.index + match.length
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
  const { attributes, children, element, selected } = props

  switch (element.type) {
    case 'time-tag':
      return (
        <span
          {...attributes}
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mx-0.5 ${
            selected ? 'bg-primary/10 text-primary ring-2 ring-primary' : 'bg-primary/10 text-primary'
          }`}
          contentEditable={false}
        >
          <span className="mr-1">暂停</span>
          <span className="time-value">{element.seconds}</span>
          <span className="ml-1">秒</span>
          {children}
        </span>
      )
    case 'animation-tag':
      return (
        <span
          {...attributes}
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mx-0.5 ${
            selected ? 'bg-primary/10 text-primary ring-2 ring-primary' : 'bg-primary/10 text-primary'
          }`}
          contentEditable={false}
        >
          <span className="mr-1">动画</span>
          {children}
        </span>
      )
    default:
      return <span {...attributes}>{children}</span>
  }
}

// 主组件
const CustomEditor = React.forwardRef<
  { insertTimeTag: (seconds: number) => void, insertAnimationTag: () => void },
  CustomEditorProps
>((props, ref) => {
  const {
    value,
    onChange,
    placeholder = "在此输入您的脚本...",
    className = ""
  } = props

  // 创建编辑器实例
  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()))
    
    // 自定义 isVoid 函数，只将时间标签设为 void 元素，动画标签不是 void 元素
    const { isVoid } = e
    e.isVoid = element => {
      return element.type === 'time-tag' ? true : isVoid(element)
    }
    
    return e
  }, [])
  
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
  
  // 插入动画标签
  const insertAnimationTag = useCallback(() => {
    // 简化为直接插入固定的动画标签
    const animationTag: CustomElement = {
      type: 'animation-tag',
      animation: '',
      children: [{ text: '' }]
    }
    
    Transforms.insertNodes(editor, animationTag)
    
    // 移动光标到标签后面
    Transforms.move(editor, { distance: 1 })
  }, [editor])

  // 删除标签
  const deleteTag = useCallback(() => {
    // 获取当前选择
    const { selection } = editor
    
    if (selection && Range.isCollapsed(selection)) {
      try {
        // 检查当前位置是否有标签
        const [node, path] = Editor.node(editor, selection)
        
        // 检查当前节点或父节点是否是标签
        let tagPath = null
        let isTag = false
        
        if (SlateElement.isElement(node) && (node.type === 'time-tag' || node.type === 'animation-tag')) {
          tagPath = path
          isTag = true
        } else {
          // 检查父节点
          try {
            // 使用 Editor.above 查找最近的父元素
            const entry = Editor.above(editor, {
              at: selection.anchor,
              match: n => SlateElement.isElement(n) && 
                (n.type === 'time-tag' || n.type === 'animation-tag')
            })
            
            if (entry) {
              const [ancestor, ancestorPath] = entry
              tagPath = ancestorPath
              isTag = true
            }
          } catch (error) {
            // 忽略错误
          }
        }
        
        // 如果找到标签，删除它
        if (isTag && tagPath) {
          Transforms.removeNodes(editor, { at: tagPath })
          return true
        }
        
        // 检查前一个位置
        const prevPoint = Editor.before(editor, selection.anchor)
        if (prevPoint) {
          const [prevNode, prevPath] = Editor.node(editor, prevPoint)
          
          if (
            SlateElement.isElement(prevNode) && 
            (prevNode.type === 'time-tag' || prevNode.type === 'animation-tag')
          ) {
            Transforms.removeNodes(editor, { at: prevPath })
            return true
          }
        }
      } catch (error) {
        // 忽略错误
      }
    }
    
    return false
  }, [editor])

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // 当按下删除键或退格键时
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // 尝试删除标签
        const deleted = deleteTag()
        
        // 如果成功删除了标签，阻止默认行为
        if (deleted) {
          event.preventDefault()
        }
      }
    },
    [deleteTag]
  )

  // 暴露方法给父组件
  useImperativeHandle(
    ref,
    () => ({
      insertTimeTag,
      insertAnimationTag
    }),
    [insertTimeTag, insertAnimationTag]
  )

  // 当外部 value 变化时更新内部值
  React.useEffect(() => {
    const newInternalValue = deserialize(value || '')
    // 只有当序列化后的值不同时才更新，避免光标重置
    if (serialize(internalValue) !== value) {
      setInternalValue(newInternalValue)
    }
  }, [value, internalValue])

  return (
    <div className={`p-2 outline-none text-base leading-relaxed overflow-auto ${className}`}>
      <Slate editor={editor} initialValue={internalValue} onChange={handleChange}>
        <Editable
          placeholder={placeholder}
          renderElement={(props) => {
            // 添加选中状态到元素属性
            const path = ReactEditor.findPath(editor, props.element)
            let selected = false
            
            if (editor.selection) {
              try {
                // 检查当前元素是否被选中
                const nodeRange = Editor.range(editor, path)
                selected = Range.includes(editor.selection, nodeRange)
              } catch (error) {
                // 忽略可能的错误
              }
            }
            
            return <Element {...props} selected={selected} />
          }}
          className="outline-none min-h-full"
          onKeyDown={handleKeyDown}
        />
      </Slate>
    </div>
  )
})

CustomEditor.displayName = "CustomEditor"

export default CustomEditor