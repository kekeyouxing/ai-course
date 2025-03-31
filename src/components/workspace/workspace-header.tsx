"use client"

import { useState } from "react"
import {
    Check,
    Eye,
    Redo,
    Undo,
    Zap,
    Square
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AspectRatioType, Scene } from "@/types/scene"
import PreviewModal from "./preview-modal"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"



interface VideoHeaderProps {
    videoTitle: string
    handleUndo: () => void
    handleRedo: () => void
    historyIndex: number
    historyLength: number
    currentScene?: Scene
    scenes?: Scene[]
    activeSceneIndex?: number
    aspectRatio?: AspectRatioType
    onAspectRatioChange?: (ratio: AspectRatioType) => void
}

export function VideoHeader({
    videoTitle,
    handleUndo,
    handleRedo,
    historyIndex,
    historyLength,
    currentScene,
    scenes = [],
    activeSceneIndex = 0,
    aspectRatio = "16:9",
    onAspectRatioChange = () => { }
}: VideoHeaderProps) {
    // 移除 isEditingTitle 状态
    const [previewOpen, setPreviewOpen] = useState<boolean>(false)
    const [aspectRatioOpen, setAspectRatioOpen] = useState<boolean>(false)

    // 比例选项
    const aspectRatioOptions: AspectRatioType[] = ["16:9", "9:16", "1:1", "4:3"];

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

                        {/* 添加比例切换按钮和弹出菜单 */}
                        <Popover open={aspectRatioOpen} onOpenChange={setAspectRatioOpen}>
                            <PopoverTrigger>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs flex items-center gap-1"
                                >
                                    <Square className="h-3.5 w-3.5" />
                                    {aspectRatio}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {aspectRatioOptions.map((ratio) => (
                                        <Button
                                            key={ratio}
                                            variant={aspectRatio === ratio ? "default" : "outline"}
                                            size="sm"
                                            className="w-full justify-center"
                                            onClick={() => {
                                                onAspectRatioChange(ratio);
                                                setAspectRatioOpen(false);
                                            }}
                                        >
                                            {ratio}
                                        </Button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

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
                    <h1 className="text-sm font-medium mr-4">{videoTitle}</h1>
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