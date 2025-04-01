"use client"

import { Scene } from "@/types/scene" 
import { ScenePreview } from "./scene-preview" 
import { Plus, Edit2, Trash, Copy, MoreVertical } from "lucide-react" // 添加更多图标
import { useState } from "react"
import { toast } from "sonner"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

// 更新组件属性，添加复制场景的回调函数
interface VideoTimelineProps {
    scenes: Scene[]
    activeScene: number
    handleSceneClick: (index: number) => void
    addNewScene: () => void
    updateSceneTitle?: (index: number, newTitle: string) => void
    aspectRatio?: string
    onDeleteScene?: (index: number) => void
    onCopyScene?: (index: number) => void // 添加复制场景的回调函数
}

export function VideoTimeline({ 
    scenes, 
    activeScene, 
    handleSceneClick, 
    addNewScene, 
    updateSceneTitle, 
    aspectRatio,
    onDeleteScene,
    onCopyScene
}: VideoTimelineProps) {
    // 计算预览尺寸的函数，根据aspectRatio调整宽高比
    const calculatePreviewDimensions = (scene: Scene, containerWidth: number) => {
        // 使用传入的aspectRatio或场景自身的aspectRatio，默认为16:9
        const sceneAspectRatio = aspectRatio || scene.aspectRatio || "16:9";

        // 解析宽高比例
        const [widthRatio, heightRatio] = sceneAspectRatio.split(":").map(Number);
        const ratio = widthRatio / heightRatio;

        // 计算预览尺寸，直接使用容器宽度和根据比例计算的高度
        const previewWidth = containerWidth;
        const previewHeight = containerWidth / ratio;

        return { width: previewWidth, height: previewHeight };
    };

    // 添加编辑状态管理
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>("");

    // 处理编辑开始
    const handleEditStart = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止冒泡，避免触发场景选择
        setEditingIndex(index);
        setEditingTitle(scenes[index].title);
    };

    // 处理标题更新
    const handleTitleUpdate = () => {
        if (editingIndex !== null && updateSceneTitle) {
            updateSceneTitle(editingIndex, editingTitle);
            setEditingIndex(null);
        }
    };

    // 处理按键事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleUpdate();
        } else if (e.key === "Escape") {
            setEditingIndex(null);
        }
    };

    // 阻止事件冒泡
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="border-t bg-white py-4">
            <div className="flex items-center mb-4">
                <div className="flex-1 ml-4 flex space-x-6 overflow-x-auto pt-4 pb-2 px-6">
                    {scenes.map((scene, index) => {
                        // 固定宽度，根据比例计算高度，保证比例不变
                        const containerWidth = 200;
                        // 使用calculatePreviewDimensions函数计算预览尺寸
                        const previewDimensions = calculatePreviewDimensions(scene, containerWidth);
                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center"
                                style={{ width: `${previewDimensions.width}px` }}
                            >
                                <div 
                                    className={`cursor-pointer transition-all duration-200 relative group ${index === activeScene ? 'scale-110 shadow-xl' : 'hover:scale-105'}`}
                                    onClick={() => handleSceneClick(index)}
                                    style={{ transformOrigin: 'center bottom' }}
                                >
                                    <ScenePreview
                                        scene={scene}
                                        width={previewDimensions.width}
                                        height={previewDimensions.height}
                                    />
                                    {/* 修改遮罩层，使其在选中时一直显示 */}
                                    <div className={`absolute inset-0 bg-black transition-opacity duration-200 pointer-events-none z-10 ${index === activeScene ? 'opacity-20' : 'opacity-0 group-hover:opacity-20'}`}></div>
                                    
                                    {/* 操作菜单 */}
                                    {index === activeScene && (
                                    <div 
                                        className="absolute top-2 right-2 z-20" 
                                        onClick={stopPropagation}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <div className="h-8 w-8 bg-white/80 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-100 active:text-gray-700 rounded-full cursor-pointer transition-colors border-0 shadow-none outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-700 flex items-center justify-center">
                                                <MoreVertical className="h-4 w-4" />
                                            </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {onCopyScene && (
                                                    <DropdownMenuItem 
                                                        className="cursor-pointer" 
                                                        onClick={() => {
                                                            onCopyScene(index);
                                                            toast.success("场景已复制");
                                                        }}
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        <span>复制场景</span>
                                                    </DropdownMenuItem>
                                                )}
                                                {scenes.length > 1 && onDeleteScene && (
                                                    <DropdownMenuItem 
                                                        className="cursor-pointer text-red-600 hover:text-red-700" 
                                                        onClick={() => {
                                                            onDeleteScene(index);
                                                            toast.success("场景已删除");
                                                        }}
                                                    >
                                                        <Trash className="mr-2 h-3 w-3" />
                                                        <span>删除场景</span>
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    )}
                                </div>
                                {/* 场景标题区域 - 独立于ScenePreview */}
                                <div className={`w-full mt-2 px-2 pb-2 transition-all duration-200`}>
                                    {editingIndex === index ? (
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                autoFocus
                                                onBlur={handleTitleUpdate}
                                                onKeyDown={handleKeyDown}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center group">
                                            <div className="text-sm font-normal truncate text-center">{scene.title || `场景 ${index + 1}`}</div>
                                            {updateSceneTitle && (
                                                <button
                                                    onClick={(e) => handleEditStart(index, e)}
                                                    className="ml-1 p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <Edit2 className="h-3 w-3 text-gray-500" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* 添加新场景按钮 */}
                    <div
                        className="flex flex-col items-center"
                        style={{ width: `200px` }}
                    >
                        <div 
                            className="cursor-pointer transition-all duration-200 relative group hover:scale-105 border rounded-md overflow-hidden"
                            onClick={addNewScene}
                            style={{ 
                                width: '200px', 
                                height: calculatePreviewDimensions({ aspectRatio: aspectRatio || "16:9" } as Scene, 200).height,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transformOrigin: 'center bottom'
                            }}
                        >
                            <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
