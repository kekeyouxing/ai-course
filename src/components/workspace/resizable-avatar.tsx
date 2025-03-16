"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { Rnd } from "react-rnd"
import { DraggableData, DraggableEvent } from "react-draggable"
import { ElementPosition } from "@/utils/alignment-utils"

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
    otherElements,
}: ResizableAvatarProps) {
    const [aspectRatio, setAspectRatio] = useState(width / height)
    const imageRef = useRef<HTMLImageElement>(null)

    // 计算图片的宽高比
    useEffect(() => {
        const img = new Image()
        img.src = src
        img.onload = () => {
            setAspectRatio(img.width / img.height)
        }
    }, [src])

    const handleResizeStop = useCallback(
        (
            e: MouseEvent | TouchEvent,
            direction: string,
            ref: HTMLElement,
            delta: { width: number; height: number },
            position: { x: number; y: number },
        ) => {
            // 获取新的宽度
            const newWidth = Number.parseInt(ref.style.width)
            // 根据宽高比计算新的高度
            const newHeight = newWidth / aspectRatio
            
            onResize({
                width: newWidth,
                height: newHeight,
                x: position.x,
                y: position.y,
            })
        },
        [onResize, aspectRatio],
    )

    const handleDragStop = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            onResize({ x: data.x, y: data.y })
        },
        [onResize],
    )

    return (
        <Rnd
            size={{ width, height }}
            position={{ x, y }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onMouseDown={(e: MouseEvent) => {
                e.stopPropagation()
                onSelect()
            }}
            style={{ 
                transform: `rotate(${rotation}deg)`,
                zIndex: isSelected ? 10 : zIndex
            }}
            lockAspectRatio={aspectRatio}
            resizeHandleComponent={{
                bottomRight: isSelected ? (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-blue-500 rounded-full translate-x-1/2 translate-y-1/2 cursor-nwse-resize">
                        <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                ) : <div /> // Replace null with an empty div
            }}
            enableResizing={{
                top: false,
                right: false,
                bottom: false,
                left: false,
                topRight: false,
                bottomRight: isSelected,
                bottomLeft: false,
                topLeft: false
            }}
        >
            <div className={`w-full h-full ${isSelected ? "outline outline-2 outline-blue-500" : ""} rounded-full overflow-hidden`}>
                <img 
                    ref={imageRef}
                    src={src} 
                    alt="Avatar" 
                    draggable="false" 
                    className="w-full h-full object-cover rounded-full"
                />
            </div>
        </Rnd>
    )
}