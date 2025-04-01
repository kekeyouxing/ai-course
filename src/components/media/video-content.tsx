"use client"

import { useEffect, useState } from "react"
import { RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { VideoElement } from "@/types/scene"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 组件属性接口
interface VideoContentProps {
  videoElement: VideoElement;
  onUpdate: (updates: Partial<VideoElement>) => void;
  onDelete: () => void; // 添加删除函数属性
  currentSceneId?: string; // 当前场景ID属性
}

export default function VideoContent({ videoElement, onUpdate, currentSceneId = '', onDelete }: VideoContentProps) {
  const [activeTab, setActiveTab] = useState("format")
  const [rotation, setRotation] = useState(videoElement?.rotation || 0)
  const [layout, setLayout] = useState({
    x: videoElement?.x || 0,
    y: videoElement?.y || 0,
    width: videoElement?.width || 0,
    height: videoElement?.height || 0,
  })

  // 视频特有属性
  const [volume, setVolume] = useState(videoElement?.volume || 0.5)
  // 移除循环播放和自动播放，添加显示模式
  const [displayMode, setDisplayMode] = useState(videoElement?.displayMode || "freeze")

  // 动画状态
  const [animationType, setAnimationType] = useState(videoElement?.animationType || "none")
  const [animationBehavior, setAnimationBehavior] = useState(videoElement?.animationBehavior || "enter")
  const [animationDirection, setAnimationDirection] = useState(videoElement?.animationDirection || "right")

  // 当选中的视频元素变化时，更新状态
  useEffect(() => {
    if (videoElement) {
      setRotation(videoElement.rotation || 0)
      setLayout({
        x: videoElement.x || 0,
        y: videoElement.y || 0,
        width: videoElement.width || 0,
        height: videoElement.height || 0,
      })
      setVolume(videoElement.volume || 0.5)
      // 更新显示模式
      setDisplayMode(videoElement.displayMode || "freeze")
      setAnimationType(videoElement.animationType || "none")
      setAnimationBehavior(videoElement.animationBehavior || "enter")
      setAnimationDirection(videoElement.animationDirection || "right")
    }
  }, [videoElement])

  // 处理旋转变化
  const handleRotationChange = (value: number[]) => {
    setRotation(value[0])
    onUpdate({ rotation: value[0] })
  }

  // 处理布局变化
  const handleLayoutChange = (property: keyof typeof layout, value: number) => {
    // 确保所有布局属性都是整数
    const roundedValue = Math.round(value);
    
    setLayout(prev => {
      const newLayout = { ...prev, [property]: roundedValue }
      onUpdate({ [property]: roundedValue })
      return newLayout
    })
  }

  // 处理音量变化
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    onUpdate({ volume: value[0] })
  }

  // 处理显示模式变化
  const handleDisplayModeChange = (value: string) => {
    setDisplayMode(value as "freeze" | "hide" | "loop")
    onUpdate({ displayMode: value as "freeze" | "hide" | "loop" })
  }

  // 处理动画类型变化
  const handleAnimationTypeChange = (value: string) => {
    setAnimationType(value as "none" | "fade" | "slide")
    onUpdate({ animationType: value as "none" | "fade" | "slide" })
  }

  // 处理动画行为变化
  const handleAnimationBehaviorChange = (value: string) => {
    setAnimationBehavior(value as "enter" | "exit" | "both")
    onUpdate({ animationBehavior: value as "enter" | "exit" | "both" })
  }

  // 处理动画方向变化
  const handleAnimationDirectionChange = (value: string) => {
    setAnimationDirection(value as "right" | "left" | "down" | "up")
    onUpdate({ animationDirection: value as "right" | "left" | "down" | "up" })
  }

  if (!videoElement) {
    return <div className="p-4">请先选择一个视频元素</div>
  }

  // 修改开始时间和结束时间的下拉选择器
  const renderStartAtSelect = () => (
    <Select
      value={videoElement?.startTime?.toString() || "default"}
      onValueChange={(value) => {
        if (value === "default") {
          onUpdate({ startTime: undefined });
        } else {
          // 将选中的时间值转换为数字并更新
          const timeValue = parseFloat(value);
          onUpdate({ startTime: timeValue });
        }
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="选择时间" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">无</SelectItem>
        {/* {sortedMarkers.map(marker => (
          <SelectItem key={marker.id} value={marker.time.toString()}>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                动画
              </span>
              <span className="truncate">{marker.description}</span>
            </div>
          </SelectItem>
        ))} */}
      </SelectContent>
    </Select>
  );

  const renderEndAtSelect = () => (
    <Select
      value={videoElement?.endTime?.toString() || "default"}
      onValueChange={(value) => {
        if (value === "default") {
          onUpdate({ endTime: undefined });
        } else {
          // 将选中的时间值转换为数字并更新
          const timeValue = parseFloat(value);
          onUpdate({ endTime: timeValue });
        }
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="选择时间" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">无</SelectItem>
        {/* {sortedMarkers.map(marker => (
          <SelectItem key={marker.id} value={marker.time.toString()}>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                动画
              </span>
              <span className="truncate">{marker.description}</span>
            </div>
          </SelectItem>
        ))} */}
      </SelectContent>
    </Select>
  );

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-gray-100 p-3 flex flex-col mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded overflow-hidden">
              <img
                src={videoElement?.thumbnail || ''}
                alt="视频预览"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* 预览文本部分 */}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-normal">
                  {"视频元素"}
                </h2>
              </div>
              {videoElement?.duration && (
                <p className="text-sm text-gray-500">{videoElement.duration}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                // 直接调用父组件传入的删除元素函数
                if (onDelete) {
                  onDelete();
                }
              }}
              title="删除视频"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="w-full">
        {/* Tab Headers */}
        <div className="grid grid-cols-2 w-full bg-gray-100">
          <button
            onClick={() => setActiveTab("format")}
            className={`text-base font-normal py-3 focus:outline-none transition-colors ${
              activeTab === "format" ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
            }`}
          >
            格式
          </button>
          <button
            onClick={() => setActiveTab("animate")}
            className={`text-base font-normal py-3 focus:outline-none transition-colors ${
              activeTab === "animate" ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
            }`}
          >
            动画
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {/* Format Tab Content */}
          {activeTab === "format" && (
            <div className="space-y-6">
                {/* 结束后显示 */}
                <div className="space-y-2">
                  <div>
                    <label className="text-base font-normal text-gray-800">结束后显示</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 px-3 ${
                        displayMode === "freeze" 
                          ? "bg-gray-100 border-gray-400 text-gray-900" 
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleDisplayModeChange("freeze")}
                    >
                      固定最后一帧
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 px-3 ${
                        displayMode === "hide" 
                          ? "bg-gray-100 border-gray-400 text-gray-900" 
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleDisplayModeChange("hide")}
                    >
                      结束后消失
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 px-3 ${
                        displayMode === "loop" 
                          ? "bg-gray-100 border-gray-400 text-gray-900" 
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleDisplayModeChange("loop")}
                    >
                      循环播放
                    </Button>
                  </div>
                </div>
              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-base font-normal text-gray-800">旋转</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleRotationChange([0])}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-right">{rotation}°</span>
                  </div>
                </div>
                <div className="px-1 py-2">
                  <Slider
                    value={[rotation]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={handleRotationChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Layout */}
              <div>
                <label className="text-base font-normal text-gray-800 block mb-2">位置和尺寸</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 mb-1">X</div>
                    <Input
                      type="text"
                      value={layout.x}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value) || 0;
                        handleLayoutChange("x", value);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 mb-1">Y</div>
                    <Input
                      type="text"
                      value={layout.y}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value) || 0;
                        handleLayoutChange("y", value);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 mb-1">宽</div>
                    <Input
                      type="text"
                      value={layout.width}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value) || 0;
                        handleLayoutChange("width", value);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 mb-1">高</div>
                    <Input
                      type="text"
                      value={layout.height}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value) || 0;
                        handleLayoutChange("height", value);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 视频特有设置 */}
              <div className="space-y-4">
                {/* 音量控制 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-base font-normal text-gray-800">音量</label>
                    <span className="text-sm font-medium">{Math.round(volume * 100)}%</span>
                  </div>
                  <div className="px-1 py-2">
                    <Slider
                      value={[volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Animate Tab Content */}
          {activeTab === "animate" && (
            <div className="space-y-6">
              {/* Animation Type */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">动画类型</label>
                <Select value={animationType} onValueChange={handleAnimationTypeChange}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="选择动画" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无</SelectItem>
                    <SelectItem value="fade">淡入淡出</SelectItem>
                    <SelectItem value="slide">滑动</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 只有当动画类型不是"无"时才显示以下选项 */}
              {animationType !== "none" && (
                <>
                  {/* Direction - Only for Slide animation */}
                  {animationType === "slide" && (
                    <div>
                      <label className="text-base font-normal text-gray-800 block mb-3">方向</label>
                      <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-full p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${animationDirection === "right" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => handleAnimationDirectionChange("right")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${animationDirection === "left" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => handleAnimationDirectionChange("left")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5"></path>
                            <path d="m12 19-7-7 7-7"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${animationDirection === "down" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => handleAnimationDirectionChange("down")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14"></path>
                            <path d="m19 12-7 7-7-7"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${animationDirection === "up" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => handleAnimationDirectionChange("up")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19V5"></path>
                            <path d="m5 12 7-7 7 7"></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Behavior */}
                  <div>
                    <label className="text-base font-normal text-gray-800 block mb-3">行为</label>
                    <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full py-2 ${animationBehavior === "enter" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => handleAnimationBehaviorChange("enter")}
                      >
                        进入
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full py-2 ${animationBehavior === "exit" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => handleAnimationBehaviorChange("exit")}
                      >
                        退出
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full py-2 ${animationBehavior === "both" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => handleAnimationBehaviorChange("both")}
                      >
                        两者
                      </Button>
                    </div>
                  </div>
                  
                  {(animationBehavior === "enter" || animationBehavior === "both") && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-base font-normal text-gray-800">开始于</label>
                        {renderStartAtSelect()}
                      </div>
                    </div>
                  )}

                  {(animationBehavior === "exit" || animationBehavior === "both") && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-base font-normal text-gray-800">结束于</label>
                        {renderEndAtSelect()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
