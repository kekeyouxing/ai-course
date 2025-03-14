"use client"

import { useState, useEffect } from "react"
import { Play, Trash2 } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import avatarImage from "@/assets/avatar.png"
import "./color-picker.css" // 导入自定义样式

// 导入背景类型
import type { Background, ColorBackground, ImageBackground, VideoBackground } from "@/app/video-edioter"

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

export function BackgroundContent({ currentBackground, onBackgroundChange }: BackgroundContentProps) {
  const [activeTab, setActiveTab] = useState("Color")
  const [selectedColor, setSelectedColor] = useState(() => {
    // 初始化颜色为当前背景颜色（如果是颜色类型）
    return currentBackground?.type === "color" 
      ? (currentBackground as ColorBackground).color 
      : "#FFFFFF";
  })

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
  const handleImageSelect = (title: string) => {
    if (onBackgroundChange) {
      onBackgroundChange({
        type: "image",
        src: avatarImage, // 这里使用实际图片路径
        title: title
      });
    }
  }

  // 处理视频选择
  const handleVideoSelect = (title: string) => {
    if (onBackgroundChange) {
      // 根据标题选择对应的视频路径和缩略图
      let videoSrc = "";
      let thumbnailSrc = avatarImage; // 默认使用头像图片作为缩略图
      switch (title) {
        case "日落视频":
          videoSrc = "https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/liu.mov";
          // 如果有专门的缩略图，可以在这里设置
          // thumbnailSrc = "/thumbnails/sunset.jpg";
          break;
        default:
          videoSrc = "/videos/default.mp4";
      }
      
      onBackgroundChange({
        type: "video",
        src: videoSrc,
        title: title,
        duration: "00:22",
        thumbnail: thumbnailSrc
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-50">
      {/* Preview Section - 显示当前背景 */}
      {currentBackground && (
        <div className="bg-gray-100 p-3 flex items-center justify-between mb-3">
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
                        alt={(currentBackground as ImageBackground).title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                case "video":
                  return (
                    <div className="w-12 h-12 rounded overflow-hidden relative group">
                      {/* 视频缩略图 */}
                      <img
                        src={(currentBackground as VideoBackground).thumbnail || avatarImage}
                        alt={(currentBackground as VideoBackground).title}
                        className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-300"
                      />
                      {/* 视频预览 - 悬停时显示 */}
                      <video
                        src={(currentBackground as VideoBackground).src}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      {/* 播放图标 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-black bg-opacity-60 flex items-center justify-center">
                          <Play size={12} color="white" />
                        </div>
                      </div>
                    </div>
                  );
                default:
                  return null;
              }
            })()}
            
            {/* 预览文本部分 */}
            <div>
              <h2 className="text-lg font-normal">
                {currentBackground.type === "color" 
                  ? "背景颜色" 
                  : currentBackground.type === "image" 
                    ? (currentBackground as ImageBackground).title 
                    : (currentBackground as VideoBackground).title}
              </h2>
              {currentBackground.type === "video" && (
                <p className="text-sm text-gray-500">{(currentBackground as VideoBackground).duration}</p>
              )}
            </div>
          </div>
          <div>
            <button
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 cursor-pointer"
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
      )}

      {/* Custom Tabs */}
      <div className="w-full">
        {/* Tab Headers */}
        <div className="grid grid-cols-4 w-full bg-gray-100">
          {["Color", "Images", "Videos", "Upload"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-normal py-2 focus:outline-none transition-colors ${
                activeTab === tab ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
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
                      {colorPresets.map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-6 w-6 p-0 rounded-md"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorSelect(color)}
                        />
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
              <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => handleImageSelect("森林航拍")}>
                <img
                  src={avatarImage}
                  width={300}
                  height={200}
                  alt="森林航拍"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => handleImageSelect("海滩风光")}>
                <img
                  src={avatarImage}
                  width={300}
                  height={200}
                  alt="海滩风光"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => handleImageSelect("城市夜景")}>
                <img
                  src={avatarImage}
                  width={300}
                  height={200}
                  alt="城市夜景"
                  className="w-full h-full object-cover"
                />
              </div>
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
              <div
                className="rounded-lg overflow-hidden relative cursor-pointer group"
                onClick={() => handleVideoSelect("日落视频")}
              >
                <img
                  src={avatarImage}
                  width={300}
                  height={200}
                  alt="日落视频"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-2 right-2">
                  <div className="w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Play size={16} color="white" fill="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab Content */}
        {activeTab === "Upload" && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0H8m12 0a4 4 0 01-4-4v-4m32 0v-4a4 4 0 00-4-4h-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                拖放文件到此处，或者
              </p>
              <button className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                浏览文件
              </button>
              <p className="mt-2 text-xs text-gray-500">
                支持PNG, JPG, GIF, MP4格式
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

