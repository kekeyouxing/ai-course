"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { Rnd } from "react-rnd"
import { DraggableData, DraggableEvent } from "react-draggable"
import { checkForSnapping, ElementPosition, AlignmentGuide } from "@/utils/alignment-utils"
import { AlignmentGuides } from "./alignment-guides"

interface ResizableAvatarProps {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
    zIndex?: number
    onResize: (newSize: Partial<ResizableAvatarProps>) => void
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

export function ResizableAvatar({
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
    otherElements = [],
}: ResizableAvatarProps) {
    const [aspectRatio, setAspectRatio] = useState(width / height)
    const imageRef = useRef<HTMLImageElement>(null)
    const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([])
    const [isDragging, setIsDragging] = useState(false)
    
    // 计算实际显示尺寸与标准尺寸的比例
    const scaleX = (containerWidth || canvasWidth) / canvasWidth
    const scaleY = (containerHeight || canvasHeight) / canvasHeight
    const scale = Math.min(scaleX, scaleY)
    
    // 将标准坐标和尺寸转换为实际显示尺寸
    const displayX = x * scaleX
    const displayY = y * scaleY
    const displayWidth = width * scaleX
    const displayHeight = height * scaleY

    // 计算图片的宽高比
    useEffect(() => {
        const img = new Image()
        img.src = src
        img.onload = () => {
            setAspectRatio(img.width / img.height)
        }
    }, [src])

    // Handle drag start to set dragging state
    const handleDragStart = useCallback(() => {
        setIsDragging(true)
    }, [])
    
    // Handle drag to check for alignment
    const handleDrag = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            // Current element position (使用整数坐标)
            const currentElement: ElementPosition = {
                x: Math.round(data.x / scaleX), // 转换为标准坐标并取整
                y: Math.round(data.y / scaleY),
                width,
                height
            }
            
            // Check for snapping
            const { x: snappedX, y: snappedY, guides } = checkForSnapping(currentElement, otherElements, scale)
            
            // Update alignment guides
            setAlignmentGuides(guides)
            
            // If snapping occurred, update position
            if (snappedX !== null || snappedY !== null) {
                // The snapped position will be applied by the Rnd component
                // through the position prop in the next render
            }
        },
        [width, height, scale, scaleX, scaleY, otherElements],
    )

    const handleResizeStop = useCallback(
        (
            e: MouseEvent | TouchEvent,
            direction: string,
            ref: HTMLElement,
            delta: { width: number; height: number },
            position: { x: number; y: number },
        ) => {
            // 获取新的宽度并转换回标准尺寸
            const newWidth = Math.round(Number.parseInt(ref.style.width) / scaleX)
            // 根据宽高比计算新的高度
            const newHeight = direction.includes('y') 
                ? Math.round(Number.parseInt(ref.style.height) / scaleY) 
                : Math.round(newWidth / aspectRatio)

            onResize({
                width: newWidth,
                height: newHeight,
                x: Math.round(position.x / scaleX),
                y: Math.round(position.y / scaleY),
            })
            
            // 清除对齐参考线
            setAlignmentGuides([])
        },
        [onResize, aspectRatio, scaleX, scaleY],
    )

    const handleDragStop = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            // Clear alignment guides
            setAlignmentGuides([])
            setIsDragging(false)
            
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
                onResizeStop={handleResizeStop}
                onDragStop={handleDragStop}
                onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    onSelect()
                }}
                style={{ 
                    transform: `rotate(${rotation}deg)`,
                    zIndex: isSelected ? 10 : zIndex
                }}
                lockAspectRatio={aspectRatio}
            >
                <div className="relative w-full h-full group">
                    <img 
                        ref={imageRef}
                        src={src} 
                        alt="Avatar" 
                        draggable="false" 
                        className="w-full h-full object-contain"
                    />
                    
                    {/* 选中边框和控制点 */}
                    {isSelected && (
                        <>
                            <div className="absolute inset-0 outline outline-1 outline-blue-500 pointer-events-none" />
                            <div className="absolute top-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ns-resize">
                                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="absolute right-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-ns-resize">
                                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="absolute left-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                                <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </>
                    )}
                </div>
            </Rnd>
        </>
    )
}