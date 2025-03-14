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
    // 添加视频画布尺寸和实际显示尺寸
    canvasWidth?: number
    canvasHeight?: number
    containerWidth?: number
    containerHeight?: number
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
    // 默认标准视频尺寸为1920x1080，容器尺寸默认与画布相同
    canvasWidth = 1920,
    canvasHeight = 1080,
    containerWidth,
    containerHeight,
}: ResizableTextProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [localContent, setLocalContent] = useState(content)
    
    // 计算实际显示尺寸与标准尺寸的比例
    const scaleX = (containerWidth || canvasWidth) / canvasWidth;
    const scaleY = (containerHeight || canvasHeight) / canvasHeight;
    
    // 将标准坐标和尺寸转换为实际显示尺寸
    const displayX = x * scaleX;
    const displayY = y * scaleY;
    const displayWidth = width * scaleX;
    const displayHeight = height * scaleY;
    const displayFontSize = fontSize * Math.min(scaleX, scaleY); // 字体大小按比例缩放
    
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
            // 将实际显示尺寸转换回标准尺寸
            onResize({
                width: Number.parseInt(ref.style.width) / scaleX,
                height: Number.parseInt(ref.style.height) / scaleY,
                x: position.x / scaleX,
                y: position.y / scaleY,
            })
        },
        [onResize, scaleX, scaleY],
    )

    const handleDragStop = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            // 将实际显示位置转换回标准位置
            onResize({ 
                x: data.x / scaleX, 
                y: data.y / scaleY 
            })
        },
        [onResize, scaleX, scaleY],
    )

    // 生成文本样式
    const textStyle = {
        fontSize: `${displayFontSize}px`, // 使用缩放后的字体大小
        fontFamily,
        color: fontColor,
        backgroundColor, // 直接使用backgroundColor，支持rgba格式
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
        textAlign: alignment,
    };

    return (
        <Rnd
            size={{ width: displayWidth, height: displayHeight }} // 使用缩放后的尺寸
            position={{ x: displayX, y: displayY }} // 使用缩放后的位置
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

