"use client"
import { useCallback, useState, useEffect } from 'react';

import { Rnd } from "react-rnd"
import { DraggableData, DraggableEvent } from "react-draggable";

interface ResizableTextProps {
    content: string
    fontSize: number
    x: number
    y: number
    width: number
    height: number
    rotation: number
    fontFamily?: string
    fontColor?: string
    backgroundColor?: string
    bold?: boolean
    italic?: boolean
    alignment?: "left" | "center" | "right"
    onTextChange: (newText: string) => void
    onResize: (newSize: Partial<ResizableTextProps>) => void
    onSelect: (e: MouseEvent) => void
    isSelected: boolean
}

export function ResizableText({
    content,
    fontSize,
    x,
    y,
    width,
    height,
    rotation,
    fontFamily = "lora",
    fontColor = "#000000",
    backgroundColor = "#FFFFFF",
    bold = false,
    italic = false,
    alignment = "center",
    onTextChange,
    onResize,
    onSelect,
    isSelected,
}: ResizableTextProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [localContent, setLocalContent] = useState(content)
    // 确保组件在接收新的 content 时更新本地状态
    useEffect(() => {
        setLocalContent(content);
    }, [content]);

    const handleResizeStop = useCallback(
        (
            e: MouseEvent | TouchEvent,
            direction: string,
            ref: HTMLElement,
            delta: { width: number; height: number },
            position: { x: number; y: number },
        ) => {
            onResize({
                width: Number.parseInt(ref.style.width),
                height: Number.parseInt(ref.style.height),
                x: position.x,
                y: position.y,
            })
        },
        [onResize],
    )

    const handleDragStop = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            onResize({ x: data.x, y: data.y })
        },
        [onResize],
    )

    // 生成文本样式
    const textStyle = {
        fontSize: `${fontSize}px`,
        fontFamily,
        color: fontColor,
        backgroundColor,
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
        textAlign: alignment,
    };

    return (
        <Rnd
            size={{ width, height }}
            position={{ x, y }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onMouseDown={(e: MouseEvent) => {
                e.stopPropagation()
                onSelect(e)
            }}
        >
            <div
                className={`w-full h-full flex items-center ${isSelected ? "outline outline-1 outline-blue-500" : ""}`}
                style={{
                    ...textStyle,
                    transform: `rotate(${rotation}deg)`
                }}
                onDoubleClick={() => setIsEditing(true)}
            >
                {isEditing ? (
                    <input
                        type="text"
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                        onBlur={() => {
                            setIsEditing(false)
                            onTextChange(localContent)
                        }}
                        onMouseDown={(e) => e.stopPropagation()} // 阻止事件冒泡
                        className="w-full h-full bg-transparent outline-none"
                        style={{ fontSize: "inherit", fontFamily: "inherit", color: "inherit", fontWeight: "inherit", fontStyle: "inherit", textAlign: "inherit" }}
                    />
                ) : (
                    <div className="w-full" style={{ textAlign: "inherit" }}>
                        {localContent}
                    </div>
                )}
                {/* 保持原有的控制点代码 */}
                {isSelected && (
                    <>
                        <div
                            className="absolute top-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ns-resize">
                            <div
                                className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div
                            className="absolute right-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                            <div
                                className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div
                            className="absolute bottom-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-ns-resize">
                            <div
                                className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div
                            className="absolute left-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                            <div
                                className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </>
                )}
            </div>
        </Rnd>
    )
}

