"use client"
import {MouseEvent, useCallback, useState} from 'react';

import {Rnd} from "react-rnd"
import {DraggableData, DraggableEvent} from "react-draggable";

interface ResizableTextProps {
    content: string
    fontSize: number
    x: number
    y: number
    width: number
    height: number
    rotation: number
    onTextChange: (newText: string) => void
    onResize: (newSize: Partial<ResizableTextProps>) => void
    onSelect: (e: globalThis.MouseEvent) => void
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
                                  onTextChange,
                                  onResize,
                                  onSelect,
                                  isSelected,
                              }: ResizableTextProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [localContent, setLocalContent] = useState(content)

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
                e.stopPropagation()
                onSelect(e)
            }}
            style={{transform: `rotate(${rotation}deg)`}}
        >
            <div
                className={`w-full h-full flex items-center justify-center ${isSelected ? "outline outline-1 outline-blue-500" : ""}`}
                style={{fontSize: `${fontSize}px`}}
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
                        className="w-full h-full text-center bg-transparent outline-none"
                        style={{fontSize: "inherit"}}
                    />
                ) : (
                    localContent
                )}
                {isSelected && (
                    <>

                        <div
                            className="absolute top-0 left-1/2 w-4 h-4 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ns-resize">
                            <div
                                className="w-2 h-2 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        </div>
                        <div
                            className="absolute right-0 top-1/2 w-4 h-4 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                            <div
                                className="w-2 h-2 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        </div>
                        <div
                            className="absolute bottom-0 left-1/2 w-4 h-4 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-ns-resize">
                            <div
                                className="w-2 h-2 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        </div>
                        <div
                            className="absolute left-0 top-1/2 w-4 h-4 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                            <div
                                className="w-2 h-2 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        </div>
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[calc(100%+12px)]"
                            style={{transformOrigin: 'bottom center'}}
                        >
                        </div>
                        {/*<div*/}
                        {/*    className="absolute top-0 right-0 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-pointer"*/}
                        {/*    onMouseDown={(e) => {*/}
                        {/*        e.stopPropagation()*/}
                        {/*        document.addEventListener("mousemove", handleRotate)*/}
                        {/*        document.addEventListener(*/}
                        {/*            "mouseup",*/}
                        {/*            () => {*/}
                        {/*                document.removeEventListener("mousemove", handleRotate)*/}
                        {/*            },*/}
                        {/*            {once: true},*/}
                        {/*        )*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <div*/}
                        {/*        className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>*/}
                        {/*</div>*/}
                    </>
                )}
            </div>
        </Rnd>
    )
}

