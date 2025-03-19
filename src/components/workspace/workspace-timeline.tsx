"use client"

import { Plus } from "lucide-react"
import { Scene } from "@/types/scene" // Import the Scene type from the shared types file


// Update the component props
interface VideoTimelineProps {
    scenes: Scene[]
    activeScene: number
    handleSceneClick: (index: number) => void
    addNewScene: () => void
}

// Then in the component, update any references to scene.text to use scene.texts[0] or similar
export function VideoTimeline({ scenes, activeScene, handleSceneClick, addNewScene }: VideoTimelineProps) {
    return (
        <div className="h-[200px] border-t bg-white py-8">
            <div className="flex items-center mb-4">
                <div className="flex-1 ml-4 flex space-x-2 overflow-x-auto">
                    {scenes.map((scene, index) => (
                        <div
                            key={index}
                            className={`border rounded-md overflow-hidden w-[150px] cursor-pointer ${activeScene === index ? "ring-2 ring-blue-500" : ""}`}
                            onClick={() => handleSceneClick(index)}
                        >
                            <div className="relative">
                                <img
                                    src="/placeholder.svg?height=80&width=150"
                                    alt={`Scene ${index + 1} thumbnail`}
                                    className="w-full h-[80px] object-cover"
                                />
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                                    {scene.title}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div
                        className="border rounded-md overflow-hidden w-[80px] flex items-center justify-center cursor-pointer"
                        onClick={addNewScene}
                    >
                        <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    )
}