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
// 导出 MediaItem 类型以便在其他组件中使用
export type MediaItem = {
    id: string
    name: string
    url: string
    type: "image" | "video"
}

// 添加 props 类型定义
interface MediaContentProps {
    onAddMedia?: (item: MediaItem) => void;
}

export default function MediaContent({ onAddMedia }: MediaContentProps) {
    const [activeTab, setActiveTab] = useState("library")
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([
        { id: "1", name: "3-4.jpeg", url: placeholder, type: "image" },
        { id: "2", name: "sample-video.mp4", url: "https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/liu.mov", type: "video" },
    ])
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [itemToRename, setItemToRename] = useState<string | null>(null)
    const [newName, setNewName] = useState("")

    const inputRef = useRef<HTMLInputElement>(null)

    // 处理媒体项点击
    const handleMediaItemClick = (item: MediaItem) => {
        if (onAddMedia) {
            onAddMedia(item);
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirm = () => {
        if (itemToDelete) {
            setMediaItems(mediaItems.filter((item) => item.id !== itemToDelete))
            setItemToDelete(null)
        }
    }

    // Start rename process
    const handleRenameStart = (item: MediaItem) => {
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
        if (itemToRename && newName.trim()) {
            setMediaItems(mediaItems.map((item) => (item.id === itemToRename ? { ...item, name: newName.trim() } : item)))
        }
        setItemToRename(null)
    }

    // 根据当前选项卡筛选媒体项
    const filteredMediaItems = mediaItems.filter(item => {
        if (activeTab === "library") return true;
        if (activeTab === "image") return item.type === "image";
        if (activeTab === "video") return item.type === "video";
        return false;
    });

    return (
        <div className="max-w-4xl mx-auto bg-gray-50">
            {/* Custom Tabs - 与 background-content.tsx 保持一致 */}
            <div className="w-full">
                {/* Tab Headers */}
                <div className="grid grid-cols-3 w-full bg-gray-100">
                    {["library", "image", "video"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-normal py-2 focus:outline-none transition-colors ${activeTab === tab ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
                                }`}
                        >
                            {tab === "library" ? "素材库" : tab === "image" ? "图片" : "视频"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
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
                                    src={item.url || "/placeholder.svg"}
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
                                            onClick={() => setItemToRename(null)}
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
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

