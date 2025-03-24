"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Trash2, Upload } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import avatarImage from "@/assets/avatar.png"
import "./color-picker.css" // 导入自定义样式
import { v4 as uuidv4 } from 'uuid'
import { toast } from "sonner"
import instance_oss from "@/api/axios-oss"
import instance from '@/api/axios'
import type { Background, ColorBackground, ImageBackground, VideoBackground } from "@/types/scene"
// 定义ContentBackground类型，用于展示背景列表
interface ContentBackground {
  id: string;
  type: "color" | "image" | "video";
  title: string;
  thumbnail?: string;
  value: string; // 颜色值或资源URL
  duration?: string; // 视频时长
}

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
]
// 将颜色预设转换为ContentBackground格式
const colorBackgrounds: ContentBackground[] = colorPresets.map((color, index) => ({
  id: `color-${index}`,
  type: "color",
  title: `颜色 ${index + 1}`,
  value: color
}));

// 定义图片背景列表
const imageBackgrounds: ContentBackground[] = [
  {
    id: "image-1",
    type: "image",
    title: "森林航拍",
    thumbnail: avatarImage,
    value: avatarImage
  },
  {
    id: "image-2",
    type: "image",
    title: "海滩风光",
    thumbnail: avatarImage,
    value: avatarImage
  },
  {
    id: "image-3",
    type: "image",
    title: "城市夜景",
    thumbnail: avatarImage,
    value: avatarImage
  }
];
// 定义视频背景列表
const videoBackgrounds: ContentBackground[] = [
  {
    id: "video-1",
    type: "video",
    title: "日落视频",
    thumbnail: avatarImage,
    value: "https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/liu.mov",
    duration: "00:22"
  }
];
export function BackgroundContent({ currentBackground, onBackgroundChange }: BackgroundContentProps) {
  const [activeTab, setActiveTab] = useState("Color")
  const [selectedColor, setSelectedColor] = useState(() => {
    // 初始化颜色为当前背景颜色（如果是颜色类型）
    return currentBackground?.type === "color"
      ? (currentBackground as ColorBackground).color
      : "#FFFFFF";
  })
  // 添加视频编辑器状态
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  // 添加文件上传相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
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
  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    // 检查文件类型
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
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

    try {
      // 生成唯一的文件名
      const fileExtension = file.name.split('.').pop() || '';
      const objectKey = `background-${uuidv4()}.${fileExtension}`;

      // 获取预签名URL
      const presignedURL = await generatePresignedURL(objectKey);

      // 上传到云存储
      await uploadToTencentCloud(file, presignedURL.data, file.type);

      // 构建完整URL
      const fileUrl = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`;

      // // 根据文件类型更新背景
      // if (file.type.startsWith('image/')) {
      //   if (onBackgroundChange) {
      //     onBackgroundChange({
      //       type: "image",
      //       src: fileUrl,
      //     });
      //   }
      // } else if (file.type.startsWith('video/')) {
      //   if (onBackgroundChange) {
      //     onBackgroundChange({
      //       type: "video",
      //       src: fileUrl,
      //       duration: "未知", // 这里可以添加获取视频时长的逻辑
      //       thumbnail: avatarImage, // 可以添加生成视频缩略图的逻辑
      //       volume: 0.5,
      //       displayMode: "freeze" // 默认固定最后一帧
      //     });
      //   }
      //   setShowVideoEditor(true);
      // }

      toast.success('文件上传成功!');

      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('文件上传失败!');
    } finally {
      setIsUploading(false);
    }
  };


  // 当currentBackground变化时更新selectedColor
  useEffect(() => {
    if (currentBackground?.type === "color") {
      setSelectedColor((currentBackground as ColorBackground).color);
    }
  }, [currentBackground]);

  // 处理颜色选择
  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    if (onBackgroundChange) {
      onBackgroundChange({
        type: "color",
        color: color
      });
    }
  }

  // 处理图片选择
  const handleImageSelect = () => {
    if (onBackgroundChange) {
      onBackgroundChange({
        type: "image",
        src: avatarImage, // 这里使用实际图片路径
      });
    }
  }

  // 处理视频选择
  const handleVideoSelect = (title: string) => {
    setShowVideoEditor(true)
    if (onBackgroundChange) {
      // 根据标题选择对应的视频路径和缩略图
      let videoSrc = "";
      switch (title) {
        case "日落视频":
          videoSrc = "https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/liu.mov";
          // 如果有专门的缩略图，可以在这里设置
          break;
        default:
          videoSrc = "/videos/default.mp4";
      }

      onBackgroundChange({
        type: "video",
        src: videoSrc,
        duration: "00:22",
        volume: 0.5, // 默认音量50%
        displayMode: "freeze" // 默认固定最后一帧
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-50">
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
                  <p className="text-sm text-gray-500">{(currentBackground as VideoBackground).duration}</p>
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

      {/* Custom Tabs */}
      <div className="w-full">
        {/* Tab Headers */}
        <div className="grid grid-cols-4 w-full bg-gray-100">
          {["Color", "Images", "Videos", "Upload"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-normal py-2 focus:outline-none transition-colors ${activeTab === tab ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Color Tab Content */}
        {activeTab === "Color" && (
          <div>
            {/* Custom Color Picker */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg text-gray-600 font-normal">自定义颜色</h3>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-12 h-12 p-0 border-2"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="mb-3 custom-color-picker">
                      <HexColorPicker color={selectedColor} onChange={handleColorSelect} />
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {colorBackgrounds.map((background) => (
                        <div
                          key={background.id}
                          className="aspect-video rounded-lg overflow-hidden cursor-pointer border border-gray-200"
                          style={{ backgroundColor: background.value }}
                          onClick={() => handleColorSelect(background.value)}
                        >
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Hex</div>
                      <div className="flex h-8 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm items-center">
                        {selectedColor}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <div>
                  <p className="text-sm text-gray-600 font-medium">自定义背景色</p>
                  <p className="text-xs text-gray-500">{selectedColor}</p>
                </div>
              </div>
            </div>

            {/* Color Presets Grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
              {colorPresets.map((color) => (
                <div
                  key={color}
                  className="aspect-video rounded-lg overflow-hidden cursor-pointer border border-gray-200"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                >
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images Tab Content */}
        {activeTab === "Images" && (
          <div className="pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-x text-gray-600">场景</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {imageBackgrounds.map((background) => (
                <div
                  key={background.id}
                  className="rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (onBackgroundChange) {
                      onBackgroundChange({
                        type: "image",
                        src: background.value,
                      });
                    }
                  }}
                >
                  <img
                    src={background.thumbnail || background.value}
                    width={300}
                    height={200}
                    alt={background.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Tab Content */}
        {activeTab === "Videos" && (
          <div className="pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-x text-gray-600">视频素材</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {videoBackgrounds.map((background) => (
                <div
                  key={background.id}
                  className="rounded-lg overflow-hidden relative cursor-pointer group"
                  onClick={() => {
                    setShowVideoEditor(true);
                    if (onBackgroundChange) {
                      onBackgroundChange({
                        type: "video",
                        src: background.value,
                        duration: background.duration || "未知",
                        thumbnail: background.thumbnail || avatarImage,
                        volume: 0.5,
                        displayMode: "freeze"
                      });
                    }
                  }}
                >
                  <img
                    src={background.thumbnail}
                    width={300}
                    height={200}
                    alt={background.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* <div className="absolute bottom-2 right-2">
                  <div className="w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Play size={16} color="white" fill="white" />
                  </div>
                </div> */}
                  {background.duration && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {background.duration}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 修改 Upload 选项卡内容 */}
        {activeTab === "Upload" && (
          <div className="flex flex-col items-center justify-center py-6">
            <div
              className={`w-full max-w-md border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-gray-400 bg-gray-50' : 'border-gray-300'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                <div className="p-4 bg-gray-100 rounded-full mx-auto w-16 h-16 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">拖放文件到这里</h3>
              <p className="text-sm text-gray-500 mb-4">
                或者点击下方按钮选择文件
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                    上传中...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    选择文件
                  </span>
                )}
              </Button>
              <p className="mt-2 text-xs text-gray-500">
                支持PNG, JPG, GIF, MP4格式
              </p>

              {/* 上传进度条 */}
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>上传进度</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gray-700 h-1.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

