"use client"

import React, { useCallback, useImperativeHandle, useEffect, useRef } from "react"
import { $getRoot, $createParagraphNode, $createTextNode, $isRangeSelection, LexicalEditor, EditorState, TextNode, $getSelection, LexicalNode, UNDO_COMMAND, REDO_COMMAND, CUT_COMMAND, COPY_COMMAND, PASTE_COMMAND, PasteCommandType } from "lexical"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { v4 as uuidv4 } from "uuid"

// Custom node types
import { $createTimeTagNode, $isTimeTagNode, TimeTagNode } from "./nodes/TimeTagNode"
import { $createAnimationTagNode, $isAnimationTagNode, AnimationTagNode } from "./nodes/AnimationTagNode"

interface CustomEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Serialization function - convert Lexical content to plain text
function serialize(state: EditorState): string {
  return state.read(() => {
    const root = $getRoot();
    let text = '';

    // 递归遍历节点树
    function traverseNodes(node: LexicalNode): string {
      let nodeText = '';

      if ($isTimeTagNode(node)) {
        return `<#${node.getSeconds()}#>`;
      } else if ($isAnimationTagNode(node)) {
        const markerId = node.getMarkerId();
        return markerId ? `<@animation:${markerId}@>` : '<@animation@>';
      } else {
        // 如果节点有子节点，递归处理
        if ('getChildren' in node && typeof node.getChildren === 'function') {
          const children = node.getChildren();
          for (const child of children) {
            nodeText += traverseNodes(child);
          }
          return nodeText;
        } else {
          // 文本节点直接返回内容
          return node.getTextContent();
        }
      }
    }

    // 从根节点开始遍历
    text = traverseNodes(root);

    return text;
  });
}

// Deserialization function - convert plain text to Lexical content
function deserialize(text: string, editor: LexicalEditor): void {
  editor.update(() => {
    // Clear the editor
    const root = $getRoot();
    root.clear();

    const timeTagRegex = /<#(\d+)#>/g;
    const animationTagRegex = /<@animation(?::([a-zA-Z0-9-]+))?@>/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Process all markers
    const allMatches: { type: string, index: number, length: number, value?: number, markerId?: string }[] = [];

    // Find time markers
    while ((match = timeTagRegex.exec(text)) !== null) {
      allMatches.push({
        type: 'time-tag',
        index: match.index,
        length: match[0].length,
        value: parseInt(match[1])
      });
    }

    // Find animation markers
    while ((match = animationTagRegex.exec(text)) !== null) {
      allMatches.push({
        type: 'animation-tag',
        index: match.index,
        length: match[0].length,
        markerId: match[1] || ""
      });
    }

    // Sort by index
    allMatches.sort((a, b) => a.index - b.index);

    // Process all markers
    let currentParagraph = $createParagraphNode();
    root.append(currentParagraph);

    for (const match of allMatches) {
      // Add text before the marker
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        currentParagraph.append($createTextNode(textBefore));
      }

      // 添加标记
      if (match.type === 'time-tag') {
        const timeTagNode = $createTimeTagNode(match.value!);
        currentParagraph.append(timeTagNode);
      } else if (match.type === 'animation-tag') {
        const animationTagNode = $createAnimationTagNode(match.markerId || "");
        currentParagraph.append(animationTagNode);
      }

      lastIndex = match.index + match.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      currentParagraph.append($createTextNode(textAfter));
    }

    // If no content, keep the empty paragraph
    if (currentParagraph.getChildrenSize() === 0) {
      currentParagraph.append($createTextNode(''));
    }
  });
}

// Editor component that handles tag insertion and deletion
function EditorContainer({
  value,
  onChange,
  placeholder,
  editorRef
}: {
  value: string,
  onChange: (value: string) => void,
  placeholder: string,
  editorRef: React.MutableRefObject<{
    insertTimeTag: (seconds: number) => void,
    insertAnimationTag: () => void
  } | null>
}) {
  const [editor] = useLexicalComposerContext();
  // 跟踪上一次编辑位置的ref
  const lastSelectionRef = useRef<{anchor: number, focus: number, nodeKey: string} | null>(null);

  // 监听选择变化以记录位置
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({editorState, dirtyElements, dirtyLeaves}) => {
      // 只在有实际编辑时记录位置
      if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchor = selection.anchor;
            const focus = selection.focus;
            
            // 记录当前选择信息
            lastSelectionRef.current = {
              anchor: anchor.offset,
              focus: focus.offset,
              nodeKey: anchor.key
            };
          }
        });
      }
    });
    
    return unregister;
  }, [editor]);

  // Initialize editor with value
  useEffect(() => {
    if (value) {
      deserialize(value, editor);
    }
  }, []);

  // Handle external value changes
  useEffect(() => {
    const currentValue = serialize(editor.getEditorState());
    if (value !== currentValue) {
      // Only update if the change is from outside
      const pendingEditorState = editor._pendingEditorState;
      const activeEditorState = editor._editorState;

      if (
        (!pendingEditorState || pendingEditorState === activeEditorState) &&
        !editor._compositionKey
      ) {
        deserialize(value, editor);
      }
    }
  }, [value, editor]);

  // // 处理键盘快捷键
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // 只处理带有修饰键的事件
    if (!(event.ctrlKey || event.metaKey)) return;
    
    // 根据按键执行不同操作
    switch (event.key.toLowerCase()) {
      case 'c': // 复制
        // 使用document.execCommand简单实现复制
        event.preventDefault();
        document.execCommand('copy');
        break;
        
      case 'x': // 剪切
        // 使用document.execCommand简单实现剪切
        event.preventDefault();
        document.execCommand('cut');
        break;
        
      case 'v': // 粘贴
        // document.execCommand无法实现粘贴，改用navigator.clipboard
        event.preventDefault();
        
        // 使用剪贴板API获取文本并插入
        navigator.clipboard.readText()
          .then(clipText => {
            if (clipText) {
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  selection.insertText(clipText);
                }
              });
            }
          })
          .catch(err => {
            console.error('粘贴失败:', err);
            // 如果API失败，让用户知道需要手动粘贴
            alert('自动粘贴失败，请尝试右键粘贴或使用键盘快捷键');
          });
        break;
      case 'z': // 撤销
        event.preventDefault();
        // 直接调用撤销命令，让Lexical内部处理光标位置
        editor.dispatchCommand(UNDO_COMMAND, undefined);
        break;
        
      case 'y': // 重做
        if (event.shiftKey || event.metaKey) {
          event.preventDefault();
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }
        break;
        
      default:
        // 其他快捷键不处理
        break;
    }
  }, [editor, lastSelectionRef]);

  // Insert time tag
  const insertTimeTag = useCallback((seconds: number) => {
    editor.update(() => {
      // Replace $getRoot().getSelection() with the correct API call
      const selection = $getSelection();
      if (selection && $isRangeSelection(selection)) {
        const timeTagNode = $createTimeTagNode(seconds);
        selection.insertNodes([timeTagNode]);
      }
    });
  }, [editor]);

  // Insert animation tag
  const insertAnimationTag = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection && $isRangeSelection(selection)) {
        // 生成新的UUID作为markerId
        const markerId = uuidv4();

        // 创建动画标记节点
        const animationTagNode = $createAnimationTagNode(markerId);
        selection.insertNodes([animationTagNode]);
      }
    });
  }, [editor]);

  // Expose methods to parent component
  useImperativeHandle(
    editorRef,
    () => ({
      insertTimeTag,
      insertAnimationTag,
    }),
    [insertTimeTag, insertAnimationTag]
  );

  return (
    <>
      <PlainTextPlugin
        contentEditable={
          <ContentEditable
            className="outline-none min-h-full"
            onKeyDown={handleKeyDown}
          />
        }
        placeholder={<div className="absolute top-2 left-2 text-gray-400 pointer-events-none">{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin
        onChange={editorState => {
          const newText = serialize(editorState);
          onChange(newText);
        }}
      />
      <HistoryPlugin />
    </>
  );
}

// Main component
const CustomEditor = React.forwardRef<
  { 
    insertTimeTag: (seconds: number) => void, 
    insertAnimationTag: (markerId?: string) => { markerId: string, contextText: string } | null 
  },
  CustomEditorProps
>((props, ref) => {
  const {
    value,
    onChange,
    placeholder = "",
    className = ""
  } = props;

  // Create a ref to expose methods
  const editorRef = React.useRef<{
    insertTimeTag: (seconds: number) => void,
    insertAnimationTag: (markerId?: string) => { markerId: string, contextText: string } | null,
  } | null>(null);

  // Forward ref to internal ref
  React.useImperativeHandle(ref, () => ({
    insertTimeTag: (seconds: number) => {
      if (editorRef.current) {
        editorRef.current.insertTimeTag(seconds);
      }
    },
    insertAnimationTag: (markerId?: string) => {
      if (editorRef.current) {
        return editorRef.current.insertAnimationTag(markerId);
      }
      return null;
    },
  }), [editorRef]);

  // Initial config for Lexical
  const initialConfig = {
    namespace: 'CustomEditor',
    theme: {
      paragraph: 'mb-1',
    },
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [TimeTagNode, AnimationTagNode]
  };

  return (
    <div className={`p-2 outline-none text-base leading-relaxed overflow-visible ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <EditorContainer
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          editorRef={editorRef}
        />
      </LexicalComposer>
    </div>
  );
});

CustomEditor.displayName = "CustomEditor";

export default CustomEditor;
