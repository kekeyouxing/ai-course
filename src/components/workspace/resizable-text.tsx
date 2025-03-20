"use client"
import { useCallback, useState, useEffect } from 'react';

import { Rnd } from "react-rnd"
import { DraggableData, DraggableEvent } from "react-draggable";
import { checkForSnapping, ElementPosition, AlignmentGuide } from "@/utils/alignment-utils"
import { AlignmentGuides } from "./alignment-guides"

// Import animations
import "./text-animations.css"

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
    zIndex?: number
    onTextChange: (newText: string) => void
    onResize: (newSize: Partial<ResizableTextProps>) => void
    onSelect: (e: MouseEvent) => void
    isSelected: boolean
    // 添加视频画布尺寸和实际显示尺寸
    canvasWidth?: number
    canvasHeight?: number
    containerWidth?: number
    containerHeight?: number
    // 添加其他元素用于对齐
    otherElements?: ElementPosition[]
    // 添加动画属性
    animationType?: "none" | "fade" | "slide"
    animationBehavior?: "enter" | "exit" | "both"
    animationDirection?: "right" | "left" | "down" | "up"
    startMarkerId?: string; // 开始动画的标记ID
    endMarkerId?: string;   // 结束动画的标记ID
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
    backgroundColor = "rgba(255, 255, 255, 0)",
    bold = false,
    italic = false,
    alignment = "center",
    zIndex = 1,
    onTextChange,
    onResize,
    onSelect,
    isSelected,
    // 默认标准视频尺寸为1920x1080，容器尺寸默认与画布相同
    canvasWidth = 1920,
    canvasHeight = 1080,
    containerWidth,
    containerHeight,
    otherElements,
    // 动画属性
    animationType = "none",
    animationBehavior = "enter",
    animationDirection = "right",
    startMarkerId = "",
    endMarkerId = ""
}: ResizableTextProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [localContent, setLocalContent] = useState(content)
    const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([])
    const [isDragging, setIsDragging] = useState(false)
    
    // 计算实际显示尺寸与标准尺寸的比例
    const scaleX = (containerWidth || canvasWidth) / canvasWidth;
    const scaleY = (containerHeight || canvasHeight) / canvasHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // 将标准坐标和尺寸转换为实际显示尺寸
    const displayX = x * scaleX;
    const displayY = y * scaleY;
    const displayWidth = width * scaleX;
    const displayHeight = height * scaleY;
    const displayFontSize = fontSize * scale; // 字体大小按比例缩放
    
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
            // 将实际显示尺寸转换回标准尺寸，并确保为整数
            onResize({
                width: Math.round(Number.parseInt(ref.style.width) / scaleX),
                height: Math.round(Number.parseInt(ref.style.height) / scaleY),
                x: Math.round(position.x / scaleX),
                y: Math.round(position.y / scaleY),
            })
        },
        [onResize, scaleX, scaleY],
    )

    // Handle drag start to set dragging state
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);
    
    // Handle drag to check for alignment
    const handleDrag = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            // Current element position (使用整数坐标)
            const currentElement: ElementPosition = {
                x: Math.round(data.x / scaleX), // 转换为标准坐标并取整
                y: Math.round(data.y / scaleY),
                width,
                height
            };
            
            // Use provided otherElements or empty array if not provided
            const elementsToAlign = otherElements || [];
            
            // Check for snapping
            const { x: snappedX, y: snappedY, guides } = checkForSnapping(currentElement, elementsToAlign, scale);
            
            // Update alignment guides
            setAlignmentGuides(guides);
            
            // If snapping occurred, update position
            if (snappedX !== null || snappedY !== null) {
                // The snapped position will be applied by the Rnd component
                // through the position prop in the next render
            }
        },
        [width, height, scale, scaleX, scaleY, otherElements],
    );

    const handleDragStop = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            // Clear alignment guides
            setAlignmentGuides([]);
            setIsDragging(false);
            
            // 将实际显示位置转换回标准位置，并确保为整数
            onResize({ 
                x: Math.round(data.x / scaleX), 
                y: Math.round(data.y / scaleY) 
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
        <>
            {/* Alignment guides - only show when dragging */}
            {isDragging && alignmentGuides.length > 0 && (
                <AlignmentGuides guides={alignmentGuides} scale={scale} />
            )}
            
            <Rnd
                size={{ width: displayWidth, height: displayHeight }} // 使用缩放后的尺寸
                position={{ x: displayX, y: displayY }} // 使用缩放后的位置
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                onMouseDown={(e: MouseEvent) => {
                    e.stopPropagation()
                    onSelect(e)
                }}
                style={{
                    zIndex: zIndex
                }}
            >
                <div
                    className={`w-full h-full flex items-center ${isSelected ? "outline outline-1 outline-blue-500" : ""} ${
                        animationType === "fade" && animationBehavior === "enter" ? "animate-fade-in" :
                        animationType === "fade" && animationBehavior === "exit" ? "animate-fade-out" :
                        animationType === "fade" && animationBehavior === "both" ? "animate-fade-in" :
                        animationType === "slide" && animationBehavior === "enter" && animationDirection === "right" ? "animate-slide-in-left" :
                        animationType === "slide" && animationBehavior === "exit" && animationDirection === "right" ? "animate-slide-out-right" :
                        animationType === "slide" && animationBehavior === "both" && animationDirection === "right" ? "animate-slide-in-right" :
                        animationType === "slide" && animationBehavior === "enter" && animationDirection === "left" ? "animate-slide-in-right" :
                        animationType === "slide" && animationBehavior === "exit" && animationDirection === "left" ? "animate-slide-out-left" :
                        animationType === "slide" && animationBehavior === "both" && animationDirection === "left" ? "animate-slide-in-left" :
                        animationType === "slide" && animationBehavior === "enter" && animationDirection === "down" ? "animate-slide-in-down" :
                        animationType === "slide" && animationBehavior === "exit" && animationDirection === "down" ? "animate-slide-out-down" :
                        animationType === "slide" && animationBehavior === "both" && animationDirection === "down" ? "animate-slide-in-down" :
                        animationType === "slide" && animationBehavior === "enter" && animationDirection === "up" ? "animate-slide-in-up" :
                        animationType === "slide" && animationBehavior === "exit" && animationDirection === "up" ? "animate-slide-out-up" :
                        animationType === "slide" && animationBehavior === "both" && animationDirection === "up" ? "animate-slide-in-up" :
                        ""
                    }`}
                    style={{
                        ...textStyle,
                        transform: `rotate(${rotation}deg)`,
                        animationDuration: "1s"
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
                        style={{ fontSize: "inherit", fontFamily: "inherit", color: "inherit", fontWeight: "inherit", fontStyle: "inherit", textAlign: alignment }}
                    />
                ) : (
                    <div className="w-full" style={{ textAlign: alignment }}>
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
        </>
    )
}

