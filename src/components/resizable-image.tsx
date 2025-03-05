"use client"

import type React from "react"
import {useCallback} from "react"
import {Rnd} from "react-rnd"

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
        (e: MouseEvent | TouchEvent, data: { x: number; y: number }) => {
            onResize({x: data.x, y: data.y})
        },
        [onResize],
    )

    const handleRotate = useCallback(
        (event: MouseEvent) => {
            const centerX = x + width / 2
            const centerY = y + height / 2
            const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI)
            onResize({rotation: angle})
        },
        [x, y, width, height, onResize],
    )

    return (
        <Rnd
            size={{width, height}}
            position={{x, y}}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onMouseDown={(e: globalThis.MouseEvent) => {
                console.log(e)
                e.stopPropagation()
                onSelect()
            }}
            style={{transform: `rotate(${rotation}deg)`}}
        >
            <div className={`w-full h-full ${isSelected ? "outline outline-1 outline-blue-500" : ""}`}>
                <img src={src || "/placeholder.svg"} alt="Resizable element" className="w-full h-full object-cover"/>
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
                        <div
                            className="absolute top-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-pointer"
                            onMouseDown={(e) => {
                                e.stopPropagation()
                                document.addEventListener("mousemove", handleRotate)
                                document.addEventListener(
                                    "mouseup",
                                    () => {
                                        document.removeEventListener("mousemove", handleRotate)
                                    },
                                    {once: true},
                                )
                            }}
                        >
                            <div
                                className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        </div>
                    </>
                )}
            </div>
        </Rnd>
    )
}

