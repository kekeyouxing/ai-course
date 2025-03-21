"use client"
import { useState, useRef } from "react"
import { Search, Upload, MoreHorizontal, Trash, Edit, X, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import placeholder from "@/assets/placeholder.svg"
import ImageContent from "@/components/media/image-content"
import VideoContent from "@/components/media/video-content" // 添加 VideoContent 导入
import { ImageElement, MediaItem, VideoElement } from "@/types/scene"
// 媒体库项类型定义
export interface ContentMediaItem {
    id: number
    type: "image" | "video"
    src: string
    thumbnail?: string
    name: string
}
// 添加 props 类型定义
interface MediaContentProps {
    onAddMedia?: (item: ContentMediaItem) => void;
    selectedMedia?: MediaItem | null;
    onUpdateImage?: (mediaId: string, updates: Partial<ImageElement>) => void;
    onUpdateVideo?: (mediaId: string, updates: Partial<VideoElement>) => void;
    currentSceneId?: string;
    onDelete: () => void;
}

export default function MediaContent({
    onAddMedia,
    selectedMedia,
    onUpdateImage,
    onUpdateVideo,
    currentSceneId = '',
    onDelete
}: MediaContentProps) {
    const [activeTab, setActiveTab] = useState("library")
    const [mediaItems, setMediaItems] = useState<ContentMediaItem[]>([
        {
            id: 1,
            name: "3-4.jpeg",
            type: "image",
            src: placeholder,
        },
        {
            id: 2,
            name: "sample-video.mp4",
            type: "video",
            src: "https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/liu.mov"
        },
    ])
    const [itemToDelete, setItemToDelete] = useState<number | undefined>(undefined)
    const [itemToRename, setItemToRename] = useState<number | undefined>(undefined)
    const [newName, setNewName] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    const inputRef = useRef<HTMLInputElement>(null)

    // 处理媒体项点击
    const handleMediaItemClick = (item: ContentMediaItem) => {
        if (onAddMedia) {
            onAddMedia(item);
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirm = () => {
        if (itemToDelete !== undefined) {
            setMediaItems(mediaItems.filter((item) => item.id !== itemToDelete))
            setItemToDelete(undefined)
        }
    }

    // Start rename process
    const handleRenameStart = (item: ContentMediaItem) => {
        setItemToRename(item.id)
        setNewName(item.name)
        // Focus the input after rendering
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus()
                inputRef.current.select()
            }
        }, 0)
    }

    // Complete rename process
    const handleRenameComplete = () => {
        if (itemToRename !== undefined && newName.trim()) {
            setMediaItems(mediaItems.map((item) => (item.id === itemToRename ? { ...item, name: newName.trim() } : item)))
        }
        setItemToRename(undefined)
    }

    // 根据当前选项卡和搜索词筛选媒体项
    const filteredMediaItems = mediaItems.filter(item => {
        const matchesTab = activeTab === "library" ||
            (activeTab === "image" && item.type === "image") ||
            (activeTab === "video" && item.type === "video");
        const matchesSearch = !searchTerm ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // 渲染媒体库内容
    const renderLibraryContent = () => (
        <div className="p-4">
            {/* Search and Upload */}
            <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="搜索媒体"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>
                <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                    <Upload className="h-4 w-4 text-gray-600" />
                </button>
            </div>

            {/* Media Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredMediaItems.map((item) => (
                    <div key={item.id} className="space-y-2">
                        <div
                            className="relative aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer"
                            onClick={() => handleMediaItemClick(item)}
                        >
                            {item.type === "video" ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                                        <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-1"></div>
                                    </div>
                                </div>
                            ) : null}
                            <img
                                src={item.src || "/placeholder.svg"}
                                alt={item.name}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            {itemToRename === item.id ? (
                                <div className="flex items-center space-x-1 flex-1">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleRenameComplete()}
                                        className="text-xs px-1 py-0.5 border border-gray-300 rounded flex-1 min-w-0"
                                    />
                                    <button onClick={handleRenameComplete} className="p-1 text-green-600 hover:bg-gray-100 rounded-full">
                                        <Check className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => setItemToRename(undefined)}
                                        className="p-1 text-red-600 hover:bg-gray-100 rounded-full"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-xs text-gray-600 truncate">{item.name}</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1 rounded-full hover:bg-gray-100">
                                                <MoreHorizontal className="h-3 w-3 text-gray-500" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-36">
                                            <DropdownMenuItem onClick={() => handleRenameStart(item)}>
                                                <Edit className="h-3 w-3 mr-2" />
                                                重命名
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setItemToDelete(item.id)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash className="h-3 w-3 mr-2" />
                                                删除
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMediaEditor = () => {
        if (!selectedMedia) return null;

        if (selectedMedia.type === "image") {
            return (
                <ImageContent
                    imageElement={selectedMedia.element as ImageElement}
                    onUpdate={(updates) => onUpdateImage && onUpdateImage(selectedMedia.id, updates)}
                    currentSceneId={currentSceneId}
                    onDelete={onDelete}
                />
            );
        } else if (selectedMedia.type === "video") {
            return (
                <VideoContent
                    videoElement={selectedMedia.element as VideoElement}
                    onUpdate={(updates) => onUpdateVideo && onUpdateVideo(selectedMedia.id, updates)}
                    currentSceneId={currentSceneId}
                    onDelete={onDelete}
                />
            );
        }

        return null;
    };

    return (
        <div className="max-w-4xl mx-auto bg-gray-50 h-full flex flex-col">
            {selectedMedia ? (
                // 编辑模式 - 完全覆盖整个组件
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        {renderMediaEditor()}
                    </div>
                </div>
            ) : (
                // 正常模式 - 显示标签页
                <div className="flex-1 flex flex-col">
                    {/* Tab Headers */}
                    <div className="grid grid-cols-3 w-full bg-gray-100">
                        {["library", "image", "video"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-sm font-normal py-2 focus:outline-none transition-colors ${activeTab === tab
                                    ? "bg-white border-b-2 border-black font-medium"
                                    : "hover:bg-gray-200"
                                    }`}
                            >
                                {tab === "library" ? "素材库" :
                                    tab === "image" ? "图片" : "视频"}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === "library" && renderLibraryContent()}
                        {activeTab === "image" && renderLibraryContent()}
                        {activeTab === "video" && renderLibraryContent()}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作无法撤销，将永久删除所选媒体项。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

