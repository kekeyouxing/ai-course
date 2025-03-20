"use client"

import React, { useCallback, useImperativeHandle, useEffect } from "react"
import { $getRoot, $createParagraphNode, $createTextNode, $isRangeSelection, LexicalEditor, EditorState, TextNode, $getSelection, LexicalNode } from "lexical"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { useAnimationMarkers } from "@/hooks/animation-markers-context"
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
        return '<@animation@>';
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
    const animationTagRegex = /<@animation@>/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Process all markers
    const allMatches: { type: string, index: number, length: number, value?: number }[] = [];

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
        length: match[0].length
      });
    }

    // Sort by index
    allMatches.sort((a, b) => a.index - b.index);

    // Process all markers
    for (const match of allMatches) {
      // Add text before the marker
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        const paragraphNode = $createParagraphNode();
        paragraphNode.append($createTextNode(textBefore));
        root.append(paragraphNode);
      }

      // Add the marker
      if (match.type === 'time-tag') {
        const timeTagNode = $createTimeTagNode(match.value!);
        root.append(timeTagNode);
      } else if (match.type === 'animation-tag') {
        const animationTagNode = $createAnimationTagNode();
        root.append(animationTagNode);
      }

      lastIndex = match.index + match.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      const paragraphNode = $createParagraphNode();
      paragraphNode.append($createTextNode(textAfter));
      root.append(paragraphNode);
    }

    // If no content, add an empty paragraph
    if (root.getChildrenSize() === 0) {
      const paragraphNode = $createParagraphNode();
      root.append(paragraphNode);
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
  const { addMarker, removeMarker } = useAnimationMarkers();

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
      // Replace $getRoot().getSelection() with the correct API call
      const selection = $getSelection();
      if (selection && $isRangeSelection(selection)) {
        // Get context text for the animation marker
        let contextText = "";

        try {
          // Get text after cursor (up to 15 chars)
          const anchor = selection.anchor;
          const textNode = anchor.getNode();
          const textContent = textNode.getTextContent();
          const offset = anchor.offset;

          if (textContent && offset < textContent.length) {
            contextText = textContent.slice(offset, offset + 15).trim() || "文档末尾处的动画";
          } else {
            contextText = "文档末尾处的动画";
          }
        } catch (error) {
          console.error("获取上下文文本失败:", error);
          contextText = "未命名动画";
        }

        // Create a new marker ID
        const markerId = uuidv4();

        // Create animation tag node with markerId
        const animationTagNode = $createAnimationTagNode(markerId);
        selection.insertNodes([animationTagNode]);

        // Add marker to AnimationMarkersProvider
        addMarker({
          id: markerId,
          name: "未命名动画",
          timePercent: 0,
          description: contextText
        });
      }
    });
  }, [editor, addMarker]);

  // todo 删除动画标记
  // Handle keyboard events
  // const handleKeyDown = useCallback(
  //   (event: React.KeyboardEvent<HTMLDivElement>) => {
  //     if (event.key === 'Delete' || event.key === 'Backspace') {
  //       // Try to delete tag
  //       const deleted = deleteTag();

  //       // If tag was deleted, prevent default behavior
  //       if (deleted) {
  //         event.preventDefault();
  //       }
  //     }
  //   },
  //   [deleteTag]
  // );

  // Expose methods to parent component
  useImperativeHandle(
    editorRef,
    () => ({
      insertTimeTag,
      insertAnimationTag
    }),
    [insertTimeTag, insertAnimationTag]
  );

  return (
    <>
      <PlainTextPlugin
        contentEditable={
          <ContentEditable
            className="outline-none min-h-full"
            // onKeyDown={handleKeyDown}
          />
        }
        placeholder={<div className="absolute top-2 left-2 text-gray-400 pointer-events-none">{placeholder}</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin
        onChange={editorState => {
          const newText = serialize(editorState);
          console.log(newText);
          onChange(newText);
        }}
      />
      <HistoryPlugin />
    </>
  );
}

// Main component
const CustomEditor = React.forwardRef<
  { insertTimeTag: (seconds: number) => void, insertAnimationTag: () => void },
  CustomEditorProps
>((props, ref) => {
  const {
    value,
    onChange,
    placeholder = "在此输入您的脚本...",
    className = ""
  } = props;

  // Create a ref to expose methods
  const editorRef = React.useRef<{
    insertTimeTag: (seconds: number) => void,
    insertAnimationTag: () => void
  } | null>(null);

  // Forward ref to internal ref
  React.useImperativeHandle(ref, () => ({
    insertTimeTag: (seconds: number) => {
      if (editorRef.current) {
        editorRef.current.insertTimeTag(seconds);
      }
    },
    insertAnimationTag: () => {
      if (editorRef.current) {
        editorRef.current.insertAnimationTag();
      }
    }
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
