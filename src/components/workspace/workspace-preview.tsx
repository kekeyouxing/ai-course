"use client"

import { useRef } from "react"
import { ResizableText } from "@/components/workspace/resizable-text"
import { ResizableImage } from "@/components/workspace/resizable-image"
import { ResizableAvatar } from "@/components/workspace/resizable-avatar"

interface TextElement {
    content: string
    fontSize: number
    x: number
    y: number
    width: number
    height: number
    rotation: number
}

interface ImageElement {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
}

interface AvatarElement {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
}

interface Scene {
    title: string
    image: ImageElement | null
    text: TextElement | null
    avatar: AvatarElement | null
}

interface VideoPreviewProps {
    scenes: Scene[]
    activeScene: number
    selectedElement: "text" | "image" | "avatar" | null
    handleTextChange: (newText: string) => void
    handleTextResize: (newSize: Partial<TextElement>) => void
    handleImageResize: (newSize: Partial<ImageElement>) => void
    handleAvatarResize: (newSize: Partial<AvatarElement>) => void
    setSelectedElement: (element: "text" | "image" | "avatar" | null) => void
}

export function VideoPreview({
    scenes,
    activeScene,
    selectedElement,
    handleTextChange,
    handleTextResize,
    handleImageResize,
    handleAvatarResize,
    setSelectedElement
}: VideoPreviewProps) {
    const editorRef = useRef<HTMLDivElement>(null)

    return (
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div
                ref={editorRef}
                className="bg-white w-full max-w-3xl aspect-video shadow-md relative"
                onClick={(e: React.MouseEvent) => {
                    if (e.target === e.currentTarget) {
                        setSelectedElement(null)
                    }
                }}
            >
                {scenes[activeScene].text && (
                    <ResizableText
                        {...scenes[activeScene].text}
                        onTextChange={handleTextChange}
                        onResize={handleTextResize}
                        onSelect={() => setSelectedElement("text")}
                        isSelected={selectedElement === "text"}
                    />
                )}

                {scenes[activeScene].image && (
                    <ResizableImage
                        {...scenes[activeScene].image}
                        onResize={handleImageResize}
                        onSelect={() => setSelectedElement("image")}
                        isSelected={selectedElement === "image"}
                    />
                )}

                {scenes[activeScene].avatar && (
                    <ResizableAvatar
                        {...scenes[activeScene].avatar}
                        onResize={handleAvatarResize}
                        onSelect={() => setSelectedElement("avatar")}
                        isSelected={selectedElement === "avatar"}
                    />
                )}
            </div>
        </div>
    )
}