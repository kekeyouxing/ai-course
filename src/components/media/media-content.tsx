"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { Search, Upload, MoreHorizontal, Trash, Edit, X, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
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
import ImageContent from "@/components/media/image-content"
import VideoContent from "@/components/media/video-content" // 添加 VideoContent 导入
import { ImageElement, MediaItem, VideoElement } from "@/types/scene"
import { getMediaList, createMedia, ContentMediaItem, renameMedia, deleteMedia } from "@/api/media"
import instance_oss from "@/api/axios-oss"
import instance from '@/api/axios'
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid'

// 添加 props 类型定义
interface MediaContentProps {
    onAddMedia?: (item: ContentMediaItem) => void;
    selectedMedia?: MediaItem | null;
    onUpdateImage?: (mediaId: string, updates: Partial<ImageElement>) => void;
    onUpdateVideo?: (mediaId: string, updates: Partial<VideoElement>) => void;
    sceneId?: string;
    onDelete: () => void;
}

export default function MediaContent({
    onAddMedia,
    selectedMedia,
    onUpdateImage,
    onUpdateVideo,
    onDelete,
    sceneId,
}: MediaContentProps) {
    const [mainTab, setMainTab] = useState("my") // 主标签：my（我的素材）或 system（系统素材）
    const [subTab, setSubTab] = useState("all") // 子标签：all（全部）、image（图片）或 video（视频）
    const [mediaItems, setMediaItems] = useState<ContentMediaItem[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [itemToDelete, setItemToDelete] = useState<string | undefined>(undefined)
    const [itemToRename, setItemToRename] = useState<string | undefined>(undefined)
    const [newName, setNewName] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 处理媒体项点击
    const handleMediaItemClick = (item: ContentMediaItem) => {
        if (onAddMedia) {
            onAddMedia(item);
        }
    };

    // Complete rename process
    const handleRenameComplete = async () => {
        if (itemToRename !== undefined && newName.trim()) {
            try {
                // 调用重命名API
                const response = await renameMedia(itemToRename, newName.trim());
                
                if (response.code === 0) {
                    // 更新列表中的项名称
                    setMediaItems(mediaItems.map((item) => 
                        item.id === itemToRename ? { ...item, name: newName.trim() } : item
                    ));
                    toast.success("媒体已重命名");
                } else {
                    toast.error(response.msg || "重命名失败");
                }
            } catch (error) {
                console.error("重命名媒体失败:", error);
                toast.error("重命名失败");
            } finally {
                setItemToRename(undefined);
            }
        } else {
            setItemToRename(undefined);
        }
    }

    // 处理删除确认
    const handleDeleteConfirm = async () => {
        if (itemToDelete !== undefined) {
            try {
                // 调用删除API
                const response = await deleteMedia(itemToDelete);
                
                if (response.code === 0) {
                    // 从列表中移除被删除的项
                    setMediaItems(mediaItems.filter((item) => item.id !== itemToDelete));
                    toast.success("媒体已删除");
                } else {
                    toast.error(response.msg || "删除失败");
                }
            } catch (error) {
                console.error("删除媒体失败:", error);
                toast.error("删除失败");
            } finally {
                setItemToDelete(undefined);
            }
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
    const generatePresignedURL = async (objectKey: string) => {
        try {
            const response = await instance.get(`/generatePresignedURL`, {
                params: { objectKey }
            });
            return response.data;
        } catch (error) {
            console.error('获取预签名URL失败:', error);
            throw error;
        }
    };

    // 上传到腾讯云
    const uploadToTencentCloud = async (file: File, presignedURL: string, contentType: string) => {
        try {
            const response = await instance_oss.put(presignedURL, file, {
                headers: {
                    'Content-Type': contentType
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                }
            });
            return response;
        } catch (error) {
            console.error('上传到腾讯云失败:', error);
            throw error;
        }
    };
    // 处理文件选择
    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null
        if (!type) {
            setUploadError('只支持上传图片或视频文件')
            return
        }

        // 检查文件大小 (限制为 200MB)
        if (file.size > 200 * 1024 * 1024) {
            toast.error('文件大小不能超过 200MB');
            return;
        }
        setIsUploading(true)
        setUploadProgress(0)
        setUploadError(null)

        try {
            // 生成唯一的文件名
            const fileExtension = file.name.split('.').pop() || '';
            const objectKey = `/media/media-${uuidv4()}.${fileExtension}`;

            // 获取预签名URL
            const presignedURL = await generatePresignedURL(objectKey);

            // 上传到云存储
            await uploadToTencentCloud(file, presignedURL.data, file.type);

            let thumbnailUrl;
            let width = 0;
            let height = 0;

            if (type === 'video') {
                // 创建视频元素
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.currentTime = 0.1; // 设置时间点为0.1秒，确保视频已加载

                // 创建画布元素
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // 等待视频元数据加载完成
                await new Promise((resolve) => {
                    video.onloadedmetadata = () => {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        // 获取视频的宽高
                        width = video.videoWidth;
                        height = video.videoHeight;
                        resolve(null);
                    };
                });

                // 绘制视频的第一帧到画布
                context?.drawImage(video, 0, 0, canvas.width, canvas.height);

                // 将画布内容转换为Blob
                const blob = await new Promise<Blob | null>((resolve) => {
                    canvas.toBlob(resolve, 'image/jpeg');
                });

                if (blob) {
                    // Convert Blob to File
                    const thumbnailFile = new File([blob], `thumbnail-${uuidv4()}.jpg`, { type: 'image/jpeg' });

                    // 上传缩略图
                    const thumbnailKey = `/media/thumbnail-${uuidv4()}.jpg`;
                    const thumbnailPresignedURL = await generatePresignedURL(thumbnailKey);
                    await uploadToTencentCloud(thumbnailFile, thumbnailPresignedURL.data, 'image/jpeg');
                    thumbnailUrl = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${thumbnailKey}`;
                }
            } else if (type === 'image') {
                // 对于图片，创建一个Image对象来获取其尺寸
                await new Promise<void>((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        width = img.width;
                        height = img.height;
                        resolve();
                    };
                    img.src = URL.createObjectURL(file);
                });
            }

            // 构建完整URL
            const fileUrl = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`;

            // 上传成功后添加到媒体列表
            const newItem: ContentMediaItem = {
                id: uuidv4(),
                type: type,
                category: "my",
                src: fileUrl,
                name: file.name,
                thumbnail: type === 'video' ? thumbnailUrl : "",
                width: width,
                height: height
            }
            const createResponse = await createMedia(newItem)
            
            if (createResponse.code === 0) {
                setMediaItems(prev => [createResponse.data, ...prev])
                toast.success('文件上传成功!')
            } else {
                toast.error(createResponse.msg || '文件上传失败')
            }
        } catch (error) {
            console.error('上传失败:', error)
            toast.error('文件上传失败!')
        } finally {
            setIsUploading(false)
            // 清除文件选择
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }, [])

    // 加载媒体列表数据
    const loadMediaList = useCallback(async (isLoadMore = false) => {
        try {
            setLoading(true)
            const currentPage = isLoadMore ? page + 1 : 1
            
            const response = await getMediaList({
                type: subTab === "all" ? undefined : subTab,
                page: currentPage,
                pageSize: pageSize,
                category: mainTab === "system" ? "system" : "my"
            })

            if (response.code === 0 && response.data) {
                const newItems = response.data.media.map(item => ({
                    id: item.id,
                    type: item.type,
                    category: item.category,
                    src: item.src,
                    name: item.name,
                    thumbnail: item.thumbnail
                }))

                setMediaItems(prev => isLoadMore ? [...prev, ...newItems] : newItems)
                setTotal(response.data.total)
                setPage(currentPage)
                setHasMore(currentPage * pageSize < response.data.total)
            } else {
                // 当code不为0时显示错误信息
                toast.error(response.msg || '加载媒体列表失败')
            }
        } catch (error) {
            console.error('加载媒体列表失败:', error)
            toast.error('加载媒体列表失败')
        } finally {
            setLoading(false)
        }
    }, [mainTab, subTab, page, pageSize])

    // 添加滚动加载功能
    const containerRef = useRef<HTMLDivElement>(null)

    // 节流函数
    const throttle = (func: Function, limit: number) => {
        let inThrottle: boolean
        return function (...args: any[]) {
            if (!inThrottle) {
                func.apply(null, args)
                inThrottle = true
                setTimeout(() => inThrottle = false, limit)
            }
        }
    }

    // 处理滚动事件
    const handleScroll = useCallback(() => {
        if (!containerRef.current || loading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current
        // 当滚动到距离底部100px时加载更多
        if (scrollHeight - scrollTop - clientHeight < 100) {
            loadMediaList(true)
        }
    }, [loading, hasMore, loadMediaList])

    // 添加滚动事件监听
    useEffect(() => {
        const throttledHandleScroll = throttle(handleScroll, 200)
        const currentContainer = containerRef.current

        if (currentContainer) {
            currentContainer.addEventListener('scroll', throttledHandleScroll)
        }

        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener('scroll', throttledHandleScroll)
            }
        }
    }, [handleScroll])

    // 监听标签切换和搜索词变化
    useEffect(() => {
        loadMediaList()
    }, [mainTab, subTab, searchTerm, loadMediaList])

    // 根据搜索词筛选媒体项
    const filteredMediaItems = mediaItems.filter(item => {
        const matchesSearch = !searchTerm ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });
    // 定义按钮数组
    const myTabButtons = [
        { label: "全部", value: "all" },
        { label: "图片", value: "image" },
        { label: "视频", value: "video" }
    ];

    const systemTabButtons = [
        { label: "全部", value: "all" }
    ];
    // 根据当前主标签选择按钮数组
    const tabButtons = mainTab === "my" ? myTabButtons : systemTabButtons;
    // 修改渲染媒体库内容的函数，添加条件判断是否显示上传按钮
    const renderLibraryContent = () => (
        <div className="p-4" ref={containerRef}>
            {/* Search and Upload - 只在素材库标签页显示上传按钮 */}
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
                {mainTab === "my" && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                        />
                        <button
                            className="cursor-pointer p-2 border border-gray-200 rounded-md hover:bg-gray-50 active:scale-95 active:bg-gray-100 transition-transform duration-100"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            <Upload className="h-4 w-4 text-gray-600" />
                        </button>
                    </>
                )}
                {isUploading && (
                    <div className="fixed inset-x-0 top-0 p-4 bg-white shadow-md z-50">
                        <div className="max-w-md mx-auto space-y-2">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>上传中...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="w-full" />
                        </div>
                    </div>
                )}
                {uploadError && (
                    <div className="fixed inset-x-0 top-0 p-4 bg-red-50 text-red-600 shadow-md z-50">
                        <div className="max-w-md mx-auto flex justify-between items-center">
                            <span>{uploadError}</span>
                            <button onClick={() => setUploadError(null)} className="text-red-600 hover:text-red-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Items Grid */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredMediaItems.map((item) => (
                        <div key={item.id} className="space-y-2">
                            <div
                                className="relative aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer"
                                onClick={() => handleMediaItemClick(item)}
                            >
                                {item.type === "video" && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                                            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-1"></div>
                                        </div>
                                    </div>
                                )}
                                <img
                                    src={item.type === "video" && item.thumbnail ? item.thumbnail : item.src}
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
                {loading && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                )}
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
                    onDelete={onDelete}
                    sceneId={sceneId}
                />
            );
        } else if (selectedMedia.type === "video") {
            return (
                <VideoContent
                    videoElement={selectedMedia.element as VideoElement}
                    onUpdate={(updates) => onUpdateVideo && onUpdateVideo(selectedMedia.id, updates)}
                    onDelete={onDelete}
                    sceneId={sceneId}
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
                    {/* 主标签 */}
                    <div className="grid grid-cols-2 w-full bg-gray-100">
                        <button
                            onClick={() => {
                                setMainTab("my")
                                setSubTab("all")
                            }}
                            className={`text-sm font-normal py-2 focus:outline-none transition-colors ${mainTab === "my"
                                    ? "bg-white border-b-2 border-black font-medium"
                                    : "hover:bg-gray-200"
                                }`}
                        >
                            我的素材
                        </button>
                        <button
                            onClick={() => {
                                setMainTab("system")
                                setSubTab("all")
                            }}
                            className={`text-sm font-normal py-2 focus:outline-none transition-colors ${mainTab === "system"
                                    ? "bg-white border-b-2 border-black font-medium"
                                    : "hover:bg-gray-200"
                                }`}
                        >
                            系统素材
                        </button>
                    </div>

                    {/* 分类按钮组 */}

                    <div className="flex gap-2 px-4 py-3 border-b border-gray-200">
                        {tabButtons.map((button) => (
                            <button
                                key={button.value}
                                onClick={() => setSubTab(button.value)}
                                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${subTab === button.value
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                        )}
                        {renderLibraryContent()}
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
