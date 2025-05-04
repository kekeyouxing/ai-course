"use client"
import { useCallback, useState, useEffect, useRef } from 'react';

import { Rnd } from "react-rnd"
import { DraggableData, DraggableEvent } from "react-draggable";
import { checkForSnapping, ElementPosition, AlignmentGuide } from "@/utils/alignment-utils"
import { AlignmentGuides } from "./alignment-guides"
import { getAnimationClassName } from "@/utils/animation-utils";
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
    alignment?: "left" | "center" | "right" | "justify"
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
}: ResizableTextProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [localContent, setLocalContent] = useState(content)
    const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [textareaHeight, setTextareaHeight] = useState<number | null>(null);
    
    // 计算实际显示尺寸与标准尺寸的比例
    const scaleX = (containerWidth || canvasWidth) / canvasWidth;
    const scaleY = (containerHeight || canvasHeight) / canvasHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // 将标准坐标和尺寸转换为实际显示尺寸
    const displayX = x * scaleX;
    const displayY = y * scaleY;
    const displayWidth = width * scaleX;
    // 高度将根据内容自动调整，但仍保留一个最小高度
    const displayHeight = "auto";
    const displayFontSize = fontSize * scale; // 字体大小按比例缩放
    const animationClassName = getAnimationClassName(
        animationType,
        animationBehavior,
        animationDirection
    );

    // 使用ref来获取实际内容高度
    const contentRef = useRef<HTMLDivElement>(null);
    
    // 添加一个ref用于textarea
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // 自动调整textarea高度的函数
    const adjustTextareaHeight = useCallback(() => {
        if (textareaRef.current) {
            // 重置高度以获取准确的scrollHeight
            textareaRef.current.style.height = '0px';
            // 设置高度为scrollHeight
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, []);
    
    // 当进入编辑模式或内容变化时，调整textarea高度
    useEffect(() => {
        if (isEditing) {
            adjustTextareaHeight();
        }
    }, [isEditing, localContent, adjustTextareaHeight]);

    // 当内容变化时，更新实际高度到父组件
    useEffect(() => {
        if (contentRef.current) {
            const actualHeight = contentRef.current.offsetHeight;
            // 将实际高度转换回标准尺寸
            const standardHeight = Math.round(actualHeight / scaleY);
            // 只有当高度有明显变化时才更新
            if (Math.abs(standardHeight - height) > 2) {
                onResize({ height: standardHeight });
            }
        }
    }, [content, fontSize, fontFamily, bold, italic, width, scaleY]);

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
            // 只更新宽度和位置，高度将自动调整
            onResize({
                width: Math.round(Number.parseInt(ref.style.width) / scaleX),
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
                size={{ width: displayWidth, height: displayHeight }} // 高度设为auto
                position={{ x: displayX, y: displayY }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                enableResizing={{
                    top: false,
                    right: true,
                    bottom: false,
                    left: true,
                    topRight: false,
                    bottomRight: false,
                    bottomLeft: false,
                    topLeft: false
                }}
                onMouseDown={(e: MouseEvent) => {
                    e.stopPropagation()
                    onSelect(e)
                }}
                style={{
                    zIndex: zIndex
                }}
            >
                <div
                    ref={contentRef}
                    className={`w-full ${isSelected ? "outline outline-1 outline-blue-500" : ""} ${animationClassName}`}
                    style={{
                        ...textStyle,
                        transform: `rotate(${rotation}deg)`,
                        animationDuration: "1s",
                        minHeight: "1em", // 设置最小高度
                        height: "auto", // 确保高度自动适应内容
                        padding: "0", // 移除内边距
                        lineHeight: "1.2", // 设置更紧凑的行高
                        display: "inline-block", // 使元素宽度适应内容
                        whiteSpace: "pre-wrap" // 保证换行正确显示
                    }}
                    onDoubleClick={() => setIsEditing(true)}                
                >
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={localContent}
                        onChange={(e) => {
                            setLocalContent(e.target.value);
                            // 使用setTimeout确保在下一个渲染周期调整高度
                            setTimeout(adjustTextareaHeight, 0);
                        }}
                        onBlur={() => {
                            setIsEditing(false);
                            onTextChange(localContent);
                        }}
                        onMouseDown={(e) => e.stopPropagation()} // 阻止事件冒泡
                        className="w-full bg-transparent outline-none p-0 m-0 resize-none"
                        style={{ 
                            fontSize: "inherit", 
                            fontFamily: "inherit", 
                            color: "inherit", 
                            fontWeight: "inherit", 
                            fontStyle: "inherit", 
                            textAlign: alignment as any,
                            lineHeight: "1.2",
                            minHeight: "1em",
                            whiteSpace: "pre-wrap", // 保留换行
                            border: "none",
                            display: "block", // 块级元素
                            overflow: "hidden" // 隐藏滚动条
                        }}
                        autoFocus
                    />
                ) : (
                    <div className="w-full p-0 m-0" style={{ 
                        textAlign: alignment,
                        whiteSpace: "pre-wrap" // 保持与编辑模式一致的换行处理
                    }}>
                        {localContent}
                    </div>
                )}
                {/* 只保留左右两侧的控制点，移除上下控制点 */}
                {isSelected && (
                    <>
                        <div
                            className="absolute right-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
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

