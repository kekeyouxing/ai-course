"use client"

import { useState } from "react"
import {
    Check,
    Edit,
    Eye,
    Redo,
    Undo,
    Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Scene } from "@/types/scene"
import PreviewModal from "./preview-modal"

interface VideoHeaderProps {
    videoTitle: string
    setVideoTitle: (title: string) => void
    handleUndo: () => void
    handleRedo: () => void
    historyIndex: number
    historyLength: number
    currentScene?: Scene  // 添加当前场景
    scenes?: Scene[]      // 添加所有场景
    activeSceneIndex?: number // 当前场景索引
}

export function VideoHeader({
    videoTitle,
    setVideoTitle,
    handleUndo,
    handleRedo,
    historyIndex,
    historyLength,
    currentScene,
    scenes = [],
    activeSceneIndex = 0
}: VideoHeaderProps) {
    const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false)
    // 添加预览模态框的状态
    const [previewOpen, setPreviewOpen] = useState<boolean>(false)

    return (
        <>
        <header className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center space-x-4">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full border-2 border-white"></div>
                    </div>
                </div>
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={handleUndo}
                            disabled={historyIndex === 0}
                        >
                            <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRedo}
                            disabled={historyIndex === historyLength - 1}
                        >
                            <Redo className="h-4 w-4" />
                        </Button>
                        <div className="h-4 border-r border-gray-300 mx-1"></div>
                        <Button
                            variant="outline"
                            className="h-8 px-3 text-sm bg-blue-50 text-blue-500 border-blue-100 flex items-center gap-1"
                        >
                            充值
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <Zap className="h-3 w-3 text-white" />
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center">
                    {isEditingTitle ? (
                        <div className="flex items-center mr-4">
                            <input
                                type="text"
                                value={videoTitle}
                                onChange={(e) => setVideoTitle(e.target.value)}
                                className="text-sm font-medium border border-gray-300 rounded px-2 py-1 w-64"
                                autoFocus
                                onBlur={() => setIsEditingTitle(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsEditingTitle(false);
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <h1 className="text-sm font-medium mr-4">{videoTitle}</h1>
                    )}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 mr-2"
                        onClick={() => setIsEditingTitle(true)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => setPreviewOpen(true)}
                    >
                        <Eye className="h-4 w-4" />
                        预览
                    </Button>
                    <Button className="h-8 px-3 text-sm bg-black text-white flex items-center gap-1">
                        Generate
                        <Check className="h-4 w-4" />
                    </Button>
                </div>
            </header>
            
            {/* 添加预览模态框组件，传递场景数据 */}
            <PreviewModal 
                open={previewOpen} 
                onOpenChange={setPreviewOpen} 
                currentScene={currentScene}
                scenes={scenes}
                activeSceneIndex={activeSceneIndex}
            />
        </>
    )
}