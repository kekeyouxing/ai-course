"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Trash2, Upload, Search, MoreHorizontal, Edit, X, Check } from "lucide-react"
import { HexColorPicker, RgbaColor, RgbaColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import "./color-picker.css" // 导入自定义样式
import { v4 as uuidv4 } from 'uuid'
import { toast } from "sonner"
import instance_oss from "@/api/axios-oss"
import instance from '@/api/axios'
import type { Background, ColorBackground, ImageBackground, VideoBackground } from "@/types/scene"
import { getBackgroundList, createBackground, renameBackground, deleteBackground, ContentBackgroundItem } from "@/api/background"

// 修改组件接口定义
interface BackgroundContentProps {
  currentBackground?: Background;
  onBackgroundChange?: (background: Background) => void;
}

// 定义颜色预设
const colorPresets = [
  "#FFFFFF", // 白色
  "#F8F9FA", // 浅灰
  "#E9ECEF", // 灰色
  "#6C757D", // 深灰
  "#212529", // 黑色
  "#F1F8FF", // 浅蓝
  "#79B8FF", // 蓝色
  "#A3CFBB", // 绿色
  "#F8D7DA", // 粉色
  "#FFF3CD", // 黄色
  "#D1ECF1", // 青色
  "#E2E3E5", // 灰色
  "#FF0000", // 红色
  "#00FF00", // 绿色
  "#0000FF", // 蓝色
  "#FFFF00", // 黄色
  "#FF00FF", // 洋红
  "#00FFFF", // 青色
  "#FFA500", // 橙色
  "#800080", // 紫色
  "#008000", // 深绿
  "#800000", // 深红
  "#008080", // 深青
  "#000080", // 深蓝
]

export function BackgroundContent({ currentBackground, onBackgroundChange }: BackgroundContentProps) {
  const [mainTab, setMainTab] = useState("color") // 主标签：my（我的素材）、system（系统素材）或 color（颜色背景）
  const [subTab, setSubTab] = useState("all") // 子标签：all（全部）、image（图片）或 video（视频）
  const [backgroundItems, setBackgroundItems] = useState<ContentBackgroundItem[]>([])
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
  const [selectedColor, setSelectedColor] = useState(() => {
    // 初始化颜色为当前背景颜色（如果是颜色类型）
    return currentBackground?.type === "color"
      ? (currentBackground as ColorBackground).color
      : "#FFFFFF";
  })
  // 添加视频编辑器状态
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 当currentBackground变化时更新selectedColor
  useEffect(() => {
    if (currentBackground?.type === "color") {
      setSelectedColor((currentBackground as ColorBackground).color);
    }
  }, [currentBackground]);

  // 将rgba对象转换为hex字符串
  const rgbaToHex = (rgba: RgbaColor): string => {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
  };

  // 解析RGBA字符串为对象（保留用于颜色选择器）
  const parseRgbaString = (color: string): RgbaColor => {
    // 默认值
    const defaultColor: RgbaColor = { r: 255, g: 255, b: 255, a: 1 };

    // 如果是hex格式，转换为rgba
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 1 };
    }

    // 如果不是rgba格式，返回默认白色
    if (!color.startsWith('rgba(')) {
      return defaultColor;
    }

    // 提取rgba值
    const values = color.replace('rgba(', '').replace(')', '').split(',');
    if (values.length !== 4) {
      return defaultColor;
    }

    return {
      r: parseInt(values[0].trim()),
      g: parseInt(values[1].trim()),
      b: parseInt(values[2].trim()),
      a: parseFloat(values[3].trim())
    };
  };

  // 添加格式化时间函数
  const formatDuration = (seconds: number): string => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 处理颜色选择
  const handleColorSelect = (color: string | RgbaColor) => {
    let colorString: string;
    
    // 如果是rgba对象，转换为hex字符串
    if (typeof color === 'object' && color.r !== undefined) {
      colorString = rgbaToHex(color);
    } else {
      colorString = color as string;
    }

    setSelectedColor(colorString)
    if (onBackgroundChange) {
      onBackgroundChange({
        type: "color",
        color: colorString
      });
    }
  }

  // 处理媒体项点击
  const handleBackgroundItemClick = (item: ContentBackgroundItem) => {
    if (onBackgroundChange) {
      if (item.type === "image") {
        onBackgroundChange({
          type: "image",
          src: item.src,
        });
      } else if (item.type === "video") {
        setShowVideoEditor(true);
        onBackgroundChange({
          type: "video",
          src: item.src,
          thumbnail: item.thumbnail || "",
          duration: item.duration || 0,
          volume: 0.5, // 默认音量50%
          displayMode: "freeze" // 默认固定最后一帧
        });
      } else if (item.type === "color") {
        onBackgroundChange({
          type: "color",
          color: item.src
        });
      }
    }
  };

  // 处理删除确认
  const handleDeleteConfirm = async () => {
    if (itemToDelete !== undefined) {
      try {
        // 调用删除API
        await deleteBackground(itemToDelete);
        
        // 从列表中移除被删除的项
        setBackgroundItems(backgroundItems.filter((item) => item.id !== itemToDelete));
        toast.success("背景已删除");
      } catch (error) {
        console.error("删除背景失败:", error);
        toast.error("删除背景失败");
      } finally {
        setItemToDelete(undefined);
      }
    }
  };

  // 重命名开始
  const handleRenameStart = (item: ContentBackgroundItem) => {
    setItemToRename(item.id);
    setNewName(item.name);
    // 聚焦输入框
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  // 完成重命名
  const handleRenameComplete = async () => {
    if (itemToRename !== undefined && newName.trim()) {
      try {
        // 调用重命名API
        await renameBackground(itemToRename, newName.trim());
        
        // 更新列表中的项名称
        setBackgroundItems(
          backgroundItems.map((item) => 
            item.id === itemToRename ? { ...item, name: newName.trim() } : item
          )
        );
        toast.success("背景已重命名");
      } catch (error) {
        console.error("重命名背景失败:", error);
        toast.error("重命名背景失败");
      } finally {
        setItemToRename(undefined);
      }
    }
  };

  // 生成预签名URL
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    // 检查文件类型
    const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
    if (!fileType) {
      toast.error('请上传图片或视频文件');
      return;
    }

    // 检查文件大小 (限制为 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('文件大小不能超过 20MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // 生成唯一的文件名
      const fileExtension = file.name.split('.').pop() || '';
      const objectKey = `/background/background-${uuidv4()}.${fileExtension}`;

      // 获取预签名URL
      const presignedURL = await generatePresignedURL(objectKey);

      // 上传到云存储
      await uploadToTencentCloud(file, presignedURL.data, file.type);

      let thumbnailUrl = "";
      let videoDuration = 0;
      if (fileType === 'video') {
        // 创建视频元素
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.currentTime = 0.1; // 设置时间点为0.1秒，确保视频已加载

        // 获取视频时长
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => {
            videoDuration = video.duration;
            resolve();
          };
        });

        // 创建画布元素
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // 设置画布尺寸
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

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
          const thumbnailKey = `/background/thumbnail-${uuidv4()}.jpg`;
          const thumbnailPresignedURL = await generatePresignedURL(thumbnailKey);
          await uploadToTencentCloud(thumbnailFile, thumbnailPresignedURL.data, 'image/jpeg');
          thumbnailUrl = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${thumbnailKey}`;
        }
      }

      // 构建完整URL
      const fileUrl = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`;

      // 创建新背景项
      const newItem: ContentBackgroundItem = {
        id: uuidv4(),
        type: fileType,
        category: 'my', // 设置为我的背景
        src: fileUrl,
        name: file.name,
        thumbnail: fileType === 'video' ? thumbnailUrl : undefined,
        duration: fileType === 'video' ? videoDuration : undefined // 使用实际的视频时长（秒）
      };

      // 保存到后端
      await createBackground(newItem);
      
      // 添加到列表
      setBackgroundItems(prev => [newItem, ...prev]);

      toast.success('背景上传成功!');
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('背景上传失败!');
    } finally {
      setIsUploading(false);
      // 清除文件选择
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 定义标签按钮数组
  const getTabButtons = () => {
    if (mainTab === 'color') return [];
    
    // 仅在"我的背景"中提供子标签选项
    if (mainTab === 'my') {
      return [
        { label: "全部", value: "all" },
        { label: "图片", value: "image" },
        { label: "视频", value: "video" }
      ];
    }
    
    // 系统背景不需要子标签
    return [];
  };

  const tabButtons = getTabButtons();

  // 加载背景列表数据
  const loadBackgroundList = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      const currentPage = isLoadMore ? page + 1 : 1;
      
      const response = await getBackgroundList({
        type: subTab === "all" ? undefined : subTab,
        page: currentPage,
        pageSize: pageSize,
        category: mainTab === "system" ? "system" : "my"
      });

      if (response.code === 0 && response.data) {
        // 设置category字段，区分是我的背景还是系统背景
        const backgrounds = response.data.backgrounds.map(item => ({
          ...item,
          category: mainTab // 设置分类为当前标签
        }));
        
        setBackgroundItems(prev => 
          isLoadMore ? [...prev, ...backgrounds] : backgrounds
        );
        setTotal(response.data.total);
        setPage(currentPage);
        setHasMore(currentPage * pageSize < response.data.total);
      }
    } catch (error) {
      console.error('加载背景列表失败:', error);
      toast.error('加载背景列表失败');
    } finally {
      setLoading(false);
    }
  }, [mainTab, subTab, page, pageSize]);

  // 添加滚动加载功能
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 节流函数
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(...args: any[]) {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // 当滚动到距离底部100px时加载更多
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadBackgroundList(true);
    }
  }, [loading, hasMore, loadBackgroundList]);

  // 添加滚动事件监听
  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, 200);
    const currentContainer = containerRef.current;

    if (currentContainer) {
      currentContainer.addEventListener('scroll', throttledHandleScroll);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', throttledHandleScroll);
      }
    };
  }, [handleScroll]);

  // 初始加载和标签切换时加载数据
  useEffect(() => {
    if (mainTab !== 'color') {
      loadBackgroundList();
    }
  }, [mainTab, subTab, loadBackgroundList]);

  // 根据搜索词筛选背景项
  const filteredBackgroundItems = backgroundItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 渲染背景库内容
  const renderBackgroundLibrary = () => (
    <div className="p-4" ref={containerRef}>
      {/* 搜索和上传 */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索背景"
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
              onChange={handleFileChange}
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
      </div>
      
      {/* 背景项网格 */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredBackgroundItems.map((item) => (
            <div key={item.id} className="space-y-2">
              <div
                className="relative aspect-video rounded-md overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer"
                onClick={() => handleBackgroundItemClick(item)}
              >
                {/* 视频显示播放图标 */}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-1"></div>
                    </div>
                  </div>
                )}
                
                {/* 缩略图或图片 */}
                <img
                  src={item.thumbnail || item.src}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
                
                {/* 视频时长 */}
                {item.type === "video" && item.duration && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(item.duration)}
                  </div>
                )}
                
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
                    {/* 仅在"我的背景"中显示编辑选项 */}
                    {item.category === "my" && (
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
                            <Trash2 className="h-3 w-3 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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

  // 渲染颜色背景内容
  const renderColorBackgrounds = () => (
    <div className="p-4">
      {/* 自定义颜色选择器 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg text-gray-600 font-normal">自定义颜色</h3>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Popover>
            <PopoverTrigger>
              <div className="flex items-center gap-3 cursor-pointer group">
                <Button
                  variant="outline"
                  className="w-12 h-12 p-0 border-2 relative overflow-hidden cursor-pointer hover:border-gray-400 hover:shadow-md transition-all duration-200 group-hover:border-gray-400 group-hover:shadow-md"
                  style={{ backgroundColor: selectedColor }}
                >
                  {/* 编辑图标提示 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-sm"
                    >
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                </Button>
                <div className="group-hover:text-gray-700 transition-colors duration-200">
                  <p className="text-sm text-gray-600 font-medium group-hover:text-gray-800 transition-colors duration-200">自定义背景色</p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">{selectedColor}</p>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="mb-3 custom-color-picker">
                <RgbaColorPicker color={parseRgbaString(selectedColor)} onChange={handleColorSelect} />
              </div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {colorPresets.slice(0, 12).map((color, index) => (
                  <div
                    key={`color-${index}`}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer border border-gray-200"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Color</div>
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  onBlur={(e) => {
                    try {
                      // 验证hex颜色格式
                      const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value);
                      
                      if (!isValidHex) {
                        // 重置为之前的有效颜色
                        handleColorSelect(selectedColor);
                      }
                    } catch (error) {
                      // 如果解析失败，重置为之前的值
                      handleColorSelect(selectedColor);
                    }
                  }}
                  className="flex h-8 w-46 rounded-md border border-input bg-background px-3 py-1 text-sm items-center"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 颜色预设网格 */}
      <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
        {colorPresets.map((color) => (
          <div
            key={color}
            className="aspect-video rounded-lg overflow-hidden cursor-pointer border border-gray-200"
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 h-full flex flex-col">
      {/* Preview Section - 显示当前背景 */}
      {currentBackground && (
        <div className="bg-gray-100 p-3 flex flex-col mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 预览图标部分 - 根据当前背景类型显示不同内容 */}
              {(() => {
                switch (currentBackground.type) {
                  case "color":
                    return (
                      <div 
                        className="w-12 h-12 rounded"
                        style={{ backgroundColor: (currentBackground as ColorBackground).color }}
                      />
                    );
                  case "image":
                    return (
                      <div className="w-12 h-12 rounded overflow-hidden">
                        <img
                          src={(currentBackground as ImageBackground).src}
                          className="w-full h-full object-cover"
                          alt="背景图片"
                        />
                      </div>
                    );
                  case "video":
                    return (
                      <div className="w-12 h-12 rounded overflow-hidden relative group">
                        {/* 视频缩略图 */}
                        <img
                          src={(currentBackground as VideoBackground).thumbnail}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          alt="视频缩略图"
                        />
                      </div>
                    );
                  default:
                    return null;
                }
              })()}

              {/* 预览文本部分 */}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-normal">
                    {currentBackground.type === "color"
                      ? "背景颜色"
                      : currentBackground.type === "image"
                        ? "背景图片"
                        : currentBackground.type === "video"
                          ? "背景视频"
                          : "未知类型"}
                  </h2>
                </div>
                {currentBackground.type === "video" && (
                  <p className="text-sm text-gray-500">{formatDuration((currentBackground as VideoBackground).duration)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 视频编辑器按钮 - 使用图标而非文字 */}
              {currentBackground.type === "video" && (
                <button
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => setShowVideoEditor(!showVideoEditor)}
                  title={showVideoEditor ? "隐藏编辑器" : "显示编辑器"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </button>
              )}
              <button
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  if (onBackgroundChange) {
                    onBackgroundChange({
                      type: "color",
                      color: "#FFFFFF"
                    });
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* 视频编辑器 - 重新设计界面 */}
          {showVideoEditor && currentBackground.type === "video" && (
            <div className="mt-3 p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">视频设置</h3>

              {/* 音量控制 */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">音量</label>
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={(currentBackground as VideoBackground).volume || 0}
                    onChange={(e) => {
                      if (onBackgroundChange) {
                        onBackgroundChange({
                          ...(currentBackground as VideoBackground),
                          volume: parseFloat(e.target.value)
                        });
                      }
                    }}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer volume-slider"
                  />
                  <span className="text-xs font-medium text-gray-600 min-w-[36px] text-right">
                    {Math.round(((currentBackground as VideoBackground).volume || 0) * 100)}%
                  </span>
                </div>
              </div>

              {/* 显示模式 */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">结束后显示</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`text-xs py-2 px-3 rounded-md transition-colors ${(currentBackground as VideoBackground).displayMode === "freeze"
                      ? "bg-gray-200 text-gray-800 font-medium"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    onClick={() => {
                      if (onBackgroundChange) {
                        onBackgroundChange({
                          ...(currentBackground as VideoBackground),
                          displayMode: "freeze"
                        });
                      }
                    }}
                  >
                    固定最后一帧
                  </button>
                  <button
                    className={`text-xs py-2 px-3 rounded-md transition-colors ${(currentBackground as VideoBackground).displayMode === "hide"
                      ? "bg-gray-200 text-gray-800 font-medium"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    onClick={() => {
                      if (onBackgroundChange) {
                        onBackgroundChange({
                          ...(currentBackground as VideoBackground),
                          displayMode: "hide"
                        });
                      }
                    }}
                  >
                    结束后消失
                  </button>
                  <button
                    className={`text-xs py-2 px-3 rounded-md transition-colors ${(currentBackground as VideoBackground).displayMode === "loop"
                      ? "bg-gray-200 text-gray-800 font-medium"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    onClick={() => {
                      if (onBackgroundChange) {
                        onBackgroundChange({
                          ...(currentBackground as VideoBackground),
                          displayMode: "loop"
                        });
                      }
                    }}
                  >
                    循环播放
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Tabs */}
      <div className="w-full">
        {/* Main Tab Headers */}
        <div className="grid grid-cols-3 w-full bg-gray-100">
          <button
            onClick={() => {
              setMainTab("color");
              setSubTab("all");
            }}
            className={`text-sm font-normal py-2 focus:outline-none transition-colors ${
              mainTab === "color"
                ? "bg-white border-b-2 border-black font-medium"
                : "hover:bg-gray-200"
            }`}
          >
            颜色背景
          </button>
          <button
            onClick={() => {
              setMainTab("my");
              setSubTab("all");
            }}
            className={`text-sm font-normal py-2 focus:outline-none transition-colors ${
              mainTab === "my"
                ? "bg-white border-b-2 border-black font-medium"
                : "hover:bg-gray-200"
            }`}
          >
            我的背景
          </button>
          <button
            onClick={() => {
              setMainTab("system");
              setSubTab("all");
            }}
            className={`text-sm font-normal py-2 focus:outline-none transition-colors ${
              mainTab === "system"
                ? "bg-white border-b-2 border-black font-medium"
                : "hover:bg-gray-200"
            }`}
          >
            系统背景
          </button>
        </div>
      </div>

      {/* Sub Tabs 仅在"我的背景"中显示 */}
      {mainTab === "my" && tabButtons.length > 0 && (
        <div className="flex gap-2 px-4 py-3 border-b border-gray-200">
          {tabButtons.map((button) => (
            <button
              key={button.value}
              onClick={() => setSubTab(button.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                subTab === button.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* 根据当前标签渲染内容 */}
        {mainTab === "color" ? (
          renderColorBackgrounds()
        ) : (
          renderBackgroundLibrary()
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，将永久删除所选背景。
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

