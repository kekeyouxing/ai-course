"use client"
import { useCallback, useEffect, useState } from "react"
import { Rnd } from "react-rnd"
import { DraggableData, DraggableEvent } from "react-draggable"
import { checkForSnapping, ElementPosition, AlignmentGuide } from "@/utils/alignment-utils"
import { AlignmentGuides } from "./alignment-guides"

interface ResizableImageProps {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
    zIndex?: number
    onResize: (newSize: Partial<ResizableImageProps>) => void
    onSelect: () => void
    isSelected: boolean
    // Optional props for alignment
    canvasWidth?: number
    canvasHeight?: number
    containerWidth?: number
    containerHeight?: number
    // Add other elements for alignment
    otherElements?: ElementPosition[]
}

export function ResizableImage({
    src,
    width,
    height,
    x,
    y,
    rotation,
    zIndex = 1,
    onResize,
    onSelect,
    isSelected,
    canvasWidth = 1920,
    canvasHeight = 1080,
    containerWidth,
    containerHeight,
    otherElements,
}: ResizableImageProps) {
    // State for alignment guides                            
    const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

    // Calculate scale for responsive display
    const scaleX = (containerWidth || canvasWidth) / canvasWidth;
    const scaleY = (containerHeight || canvasHeight) / canvasHeight;
    const scale = Math.min(scaleX, scaleY);

    // 将标准坐标和尺寸转换为实际显示尺寸
    const displayX = x * scaleX;
    const displayY = y * scaleY;
    const displayWidth = width * scaleX;
    const displayHeight = height * scaleY;
    
    // 获取图片的原始宽高比
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            setImageAspectRatio(aspectRatio);
        };
        img.src = src;
    }, [src]);
    
    const handleResizeStop = useCallback(
        (
            e: MouseEvent | TouchEvent,
            direction: string,
            ref: HTMLElement,
            delta: { width: number; height: number },
            position: { x: number; y: number },
        ) => {
            // 获取新尺寸，转换为标准尺寸
            let newWidth = Math.round(Number.parseInt(ref.style.width) / scaleX);
            let newHeight = Math.round(Number.parseInt(ref.style.height) / scaleY);
            
            // 如果有图片宽高比，调整容器尺寸以匹配图片比例
            if (imageAspectRatio) {
                // 计算应该保持的尺寸，取较大的一个作为基准
                const widthByHeight = newHeight * imageAspectRatio;
                const heightByWidth = newWidth / imageAspectRatio;
                
                // 使用对角线长度作为参考，选择更接近用户拖拽意图的尺寸
                const currentDiagonal = Math.sqrt(newWidth * newWidth + newHeight * newHeight);
                const diagonal1 = Math.sqrt(widthByHeight * widthByHeight + newHeight * newHeight);
                const diagonal2 = Math.sqrt(newWidth * newWidth + heightByWidth * heightByWidth);
                
                if (Math.abs(diagonal1 - currentDiagonal) < Math.abs(diagonal2 - currentDiagonal)) {
                    newWidth = Math.round(widthByHeight);
                } else {
                    newHeight = Math.round(heightByWidth);
                }
            }
            
            // 获取新位置
            const newX = Math.round(position.x / scaleX);
            const newY = Math.round(position.y / scaleY);
            
            // 应用调整后的尺寸和位置
            onResize({
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY,
            });
            
            // Clear alignment guides after resize
            setAlignmentGuides([]);
        },
        [onResize, scaleX, scaleY, imageAspectRatio]
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
                const newX = snappedX !== null ? snappedX : data.x;
                const newY = snappedY !== null ? snappedY : data.y;

                // Update the position directly in the Rnd component
                // This is handled by the Rnd component's position prop
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

    return (
        <>
            {/* Alignment guides - only show when dragging */}
            {isDragging && alignmentGuides.length > 0 && (
                <AlignmentGuides guides={alignmentGuides} scale={scale} />
            )}

            <Rnd
                size={{ width: displayWidth, height: displayHeight }}
                position={{ x: displayX, y: displayY }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                onMouseDown={(e: MouseEvent) => {
                    e.stopPropagation()
                    onSelect()
                }}
                style={{
                    zIndex: zIndex
                }}
            >
                <div
                    className={`w-full h-full ${isSelected ? "outline outline-1 outline-blue-500" : ""}`}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: 'center center'
                    }}
                >
                    <img src={src} alt="Resizable element" draggable="false" className="w-full h-full object-contain" />
                    {isSelected && (
                        <>
                            {/* 角落的调整点 - 用于等比例缩放 */}
                            <div className="absolute top-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-nwse-resize">
                                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="absolute top-0 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-nesw-resize">
                                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 translate-y-1/2 cursor-nesw-resize">
                                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-nwse-resize">
                                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </>
                    )}
                </div>
            </Rnd>
        </>
    )
}

