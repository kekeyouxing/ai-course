"use client"
import {useCallback, useState} from "react"
import {Rnd} from "react-rnd"
import {DraggableData, DraggableEvent} from "react-draggable"
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
    
    // Calculate scale for responsive display
    const scaleX = (containerWidth || canvasWidth) / canvasWidth;
    const scaleY = (containerHeight || canvasHeight) / canvasHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // 将标准坐标和尺寸转换为实际显示尺寸
    const displayX = x * scaleX;
    const displayY = y * scaleY;
    const displayWidth = width * scaleX;
    const displayHeight = height * scaleY;
    
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
            // Clear alignment guides after resize
            setAlignmentGuides([]);
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
                size={{width: displayWidth, height: displayHeight}}
                position={{x: displayX, y: displayY}}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragStop={handleDragStop}
                onResizeStop={handleResizeStop}
                onMouseDown={(e: MouseEvent) => {
                    e.stopPropagation()
                    onSelect()
                }}
                style={{
                    transform: `rotate(${rotation}deg)`,
                    zIndex: zIndex
                }}
            >
                <div className={`w-full h-full ${isSelected ? "outline outline-1 outline-blue-500" : ""}`}>
                    <img src={src} alt="Resizable element" draggable="false" className="w-full h-full object-cover"/>
                    {isSelected && (
                        <>
                            <div
                                className="absolute top-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ns-resize">
                                <div
                                    className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                            </div>
                            <div
                                className="absolute right-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                                <div
                                    className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                            </div>
                            <div
                                className="absolute bottom-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-ns-resize">
                                <div
                                    className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                            </div>
                            <div
                                className="absolute left-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                                <div
                                    className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                            </div>
                        </>
                    )}
                </div>
            </Rnd>
        </>
    )
}

