"use client"

import React, { useState, useCallback, useMemo, useImperativeHandle } from "react"
import { createEditor, Descendant, Editor, Transforms, Text, Element as SlateElement, BaseEditor, Range } from "slate"
import { Slate, Editable, withReact, ReactEditor } from "slate-react"
import { withHistory, HistoryEditor } from "slate-history"
import { useAnimationMarkers } from "@/hooks/animation-markers-context"
import { v4 as uuidv4 } from "uuid"

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
  // 添加 markerId 用于关联
  markerId?: string
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
        // 简化为固定标记
        return `<@animation@>`
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
  // 简化动画标记正则表达式
  const animationTagRegex = /<@animation@>/g
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
          <span>动画</span>
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

  // 使用动画标记上下文
  const { addMarker, removeMarker } = useAnimationMarkers();

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
    // 获取当前光标位置前后的文本作为上下文
    const { selection } = editor;
    let contextText = "";
    
    if (selection) {
      try {
        // 只获取光标后面的文本作为上下文
        const end = Editor.end(editor, []);
        
        const afterRange = {
          anchor: selection.anchor,
          focus: end
        };
        
        // 获取光标后面的文本（最多20个字符）
        const afterText = Editor.string(editor, afterRange).slice(0, 15);
        
        // 如果有后续文本，使用它；否则使用一个默认描述或空字符串
        contextText = afterText.trim() || "文档末尾处的动画";
      } catch (error) {
        console.error("获取上下文文本失败:", error);
      }
    }
    
    // 创建一个新的 marker ID
    const markerId = uuidv4();
    
    // 创建动画标签并关联 markerId
    const animationTag: CustomElement = {
      type: 'animation-tag',
      animation: '',
      markerId: markerId,
      children: [{ text: '' }]
    }
    
    Transforms.insertNodes(editor, animationTag)
    
    // 移动光标到标签后面
    Transforms.move(editor, { distance: 1 })
    
    // 在 AnimationMarkersProvider 中添加标记
    addMarker({
      id: markerId,
      name: "未命名动画",
      timePercent: 0,
      description: contextText
    });
  }, [editor, addMarker])

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
        let tagNode = null
        
        if (SlateElement.isElement(node) && (node.type === 'time-tag' || node.type === 'animation-tag')) {
          tagPath = path
          isTag = true
          tagNode = node
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
              tagNode = ancestor as CustomElement
            }
          } catch (error) {
            console.error("检查父节点时出错:", error);
          }
        }
        
        // 如果找到标签，删除它
        if (isTag && tagPath) {
          // 如果是动画标签，同时删除对应的 marker
          if (tagNode && SlateElement.isElement(tagNode) && tagNode.type === 'animation-tag') {
            // 使用关联的 markerId 删除对应的 marker
            if (tagNode.markerId) {
              removeMarker(tagNode.markerId);
            }
          }
          
          Transforms.removeNodes(editor, { at: tagPath })
          return true
        }
        
        // 检查前一个位置
        const prevPoint = Editor.before(editor, selection.anchor)
        if (prevPoint) {
          try {
            const [prevNode, prevPath] = Editor.node(editor, prevPoint)
            // 如果前一个节点是文本节点，尝试获取其父节点
            if (Text.isText(prevNode)) {
              const parentEntry = Editor.parent(editor, prevPath);
              if (parentEntry) {
                const [parentNode, parentPath] = parentEntry;
                
                if (SlateElement.isElement(parentNode) && 
                    (parentNode.type === 'time-tag' || parentNode.type === 'animation-tag')) {
                  
                  // 如果是动画标签，同时删除对应的 marker
                  if (parentNode.type === 'animation-tag' && parentNode.markerId) {
                    removeMarker(parentNode.markerId);
                  }
                  
                  Transforms.removeNodes(editor, { at: parentPath })
                  return true
                }
              }
            }
            
            // 如果前一个节点本身是标签
            if (SlateElement.isElement(prevNode) && 
                (prevNode.type === 'time-tag' || prevNode.type === 'animation-tag')) {
              // 如果是动画标签，同时删除对应的 marker
              if (prevNode.type === 'animation-tag' && prevNode.markerId) {
                removeMarker(prevNode.markerId);
              }
              Transforms.removeNodes(editor, { at: prevPath })
              return true
            }
          } catch (error) {
            console.error("检查前一个位置时出错:", error);
          }
        }
        
        // 检查后一个位置
        const nextPoint = Editor.after(editor, selection.anchor)
        if (nextPoint) {
          try {
            const [nextNode, nextPath] = Editor.node(editor, nextPoint)
            if (
              SlateElement.isElement(nextNode) && 
              (nextNode.type === 'time-tag' || nextNode.type === 'animation-tag')
            ) {
              // 如果是动画标签，同时删除对应的 marker
              if (SlateElement.isElement(nextNode) && nextNode.type === 'animation-tag') {
                if (nextNode.markerId) {
                  removeMarker(nextNode.markerId);
                }
              }
              
              Transforms.removeNodes(editor, { at: nextPath })
              return true
            }
          } catch (error) {
            console.error("检查后一个位置时出错:", error);
          }
        }
      } catch (error) {
        console.error("删除标签时出错:", error);
      }
    }
    
    return false
  }, [editor, removeMarker]) // 移除了 markers 依赖，因为不再需要

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
    // 只有当序列化后的内部值与外部值不同，且不是由内部编辑引起的变化时才更新
    const currentValue = serialize(internalValue);
    if (value !== currentValue && !editor.operations.some(op => op.type !== 'set_selection')) {
      const newInternalValue = deserialize(value || '');
      setInternalValue(newInternalValue);
      
      // 保存当前选择状态
      const selection = editor.selection;
      
      // 更新编辑器内容
      editor.children = newInternalValue;
      
      // 恢复选择状态
      if (selection) {
        setTimeout(() => {
          try {
            ReactEditor.focus(editor);
            Transforms.select(editor, selection);
          } catch (e) {
            // 如果选择状态无效，忽略错误
          }
        }, 0);
      }
    }
  }, [value, editor, internalValue]);

  // 使用 key 属性强制重新渲染组件
  return (
    <div className={`p-2 outline-none text-base leading-relaxed overflow-auto ${className}`}>
      <Slate 
        editor={editor} 
        initialValue={internalValue} 
        onChange={handleChange}
        // key={value} // 添加 key 属性，当 value 变化时强制重新渲染
      >
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
