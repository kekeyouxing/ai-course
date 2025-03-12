"use client"
import {useCallback} from "react"
import {Rnd} from "react-rnd"
import {DraggableData, DraggableEvent} from "react-draggable"
interface ResizableImageProps {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
    onResize: (newSize: Partial<ResizableImageProps>) => void
    onSelect: () => void
    isSelected: boolean
}

export function ResizableImage({
                                   src,
                                   width,
                                   height,
                                   x,
                                   y,
                                   rotation,
                                   onResize,
                                   onSelect,
                                   isSelected,
                               }: ResizableImageProps) {
                                
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
            onResize({x: data.x, y: data.y})
        },
        [onResize],
    )

    return (
        <Rnd
            size={{width, height}}
            position={{x, y}}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onMouseDown={(e: MouseEvent) => {
                e.stopPropagation()
                onSelect()
            }}
            style={{transform: `rotate(${rotation}deg)`}}
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
    )
}

