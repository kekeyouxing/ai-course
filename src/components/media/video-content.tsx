"use client"

import { useEffect, useState } from "react"
import { RotateCcw, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useAnimationMarkers } from '@/hooks/animation-markers-context';
import { VideoElement } from "@/types/scene"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 组件属性接口
interface VideoContentProps {
  videoElement?: VideoElement;
  onUpdate: (updates: Partial<VideoElement>) => void;
  currentSceneId?: string; // 当前场景ID属性
}

export default function VideoContent({ videoElement, onUpdate, currentSceneId = '' }: VideoContentProps) {
  const [activeTab, setActiveTab] = useState("format")
  const [rotation, setRotation] = useState(videoElement?.rotation || 0)
  const [layout, setLayout] = useState({
    x: videoElement?.x || 0,
    y: videoElement?.y || 0,
    width: videoElement?.width || 400,
    height: videoElement?.height || 300,
  })

  // 视频特有属性
  const [volume, setVolume] = useState(videoElement?.volume || 100)
  const [loop, setLoop] = useState(videoElement?.loop || false)
  const [autoplay, setAutoplay] = useState<boolean>(videoElement?.autoplay ?? true)

  // 动画状态
  const [animationType, setAnimationType] = useState(videoElement?.animationType || "none")
  const [animationBehavior, setAnimationBehavior] = useState(videoElement?.animationBehavior || "enter")
  const [animationDirection, setAnimationDirection] = useState(videoElement?.animationDirection || "right")

  // 获取动画标记上下文
  const { getMarkersBySceneId } = useAnimationMarkers();
  // 根据当前场景ID过滤标记
  const currentSceneMarkers = currentSceneId ? getMarkersBySceneId(currentSceneId) : [];
  // 按时间排序标记
  const sortedMarkers = [...currentSceneMarkers].sort((a, b) => a.timePercent - b.timePercent);

  // 当选中的视频元素变化时，更新状态
  useEffect(() => {
    if (videoElement) {
      setRotation(videoElement.rotation || 0)
      setLayout({
        x: videoElement.x || 0,
        y: videoElement.y || 0,
        width: videoElement.width || 400,
        height: videoElement.height || 300,
      })
      setVolume(videoElement.volume || 100)
      setLoop(videoElement.loop || false)
      setAutoplay(videoElement.autoplay || true)
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

  // 处理循环变化
  const handleLoopChange = (value: boolean) => {
    setLoop(value)
    onUpdate({ loop: value })
  }

  // 处理自动播放变化
  const handleAutoplayChange = (value: boolean) => {
    setAutoplay(value)
    onUpdate({ autoplay: value })
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
      value={videoElement?.startMarkerId || "default"}
      onValueChange={(value) => {
        const markerId = value === "default" ? undefined : value;
        onUpdate({ startMarkerId: markerId });
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="选择时间" />
      </SelectTrigger>
      <SelectContent>
        {sortedMarkers.map(marker => (
          <SelectItem key={marker.id} value={marker.id}>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                动画
              </span>
              <span className="truncate">{marker.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const renderEndAtSelect = () => (
    <Select
      value={videoElement?.endMarkerId || "default"}
      onValueChange={(value) => {
        const markerId = value === "default" ? undefined : value;
        onUpdate({ endMarkerId: markerId });
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="选择时间" />
      </SelectTrigger>
      <SelectContent>
        {sortedMarkers.map(marker => (
          <SelectItem key={marker.id} value={marker.id}>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                动画
              </span>
              <span className="truncate">{marker.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-100">
        <div className="flex items-center gap-4">
          <Video className="h-6 w-6" />
          <span className="text-lg">视频</span>
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
              {/* 视频预览 */}
              <div className="mb-4 flex justify-center">
                <div 
                  className="relative border rounded-md overflow-hidden" 
                  style={{ 
                    width: '200px', 
                    height: '150px',
                  }}
                >
                  <video
                    src={videoElement.src}
                    controls
                    className="w-full h-full object-cover"
                  />
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
                    <div className="text-xs text-gray-500 mb-1">X 坐标</div>
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
                    <div className="text-xs text-gray-500 mb-1">Y 坐标</div>
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
                    <div className="text-xs text-gray-500 mb-1">宽度</div>
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
                    <div className="text-xs text-gray-500 mb-1">高度</div>
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
                    <span className="text-sm font-medium">{volume}%</span>
                  </div>
                  <div className="px-1 py-2">
                    <Slider
                      value={[volume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 循环播放 */}
                <div className="flex items-center justify-between">
                  <label className="text-base font-normal text-gray-800">循环播放</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleLoopChange(!loop)}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        loop ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          loop ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 自动播放 */}
                <div className="flex items-center justify-between">
                  <label className="text-base font-normal text-gray-800">自动播放</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleAutoplayChange(!autoplay)}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        autoplay ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          autoplay ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
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
          
                  {/* Animation Behavior */}
                  <div>
                    <label className="text-base font-normal text-gray-800 block mb-3">动画行为</label>
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
          
                  {/* Animation Timing */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-base font-normal text-gray-800 block mb-2">开始于</label>
                      <div className="flex items-center">
                        {renderStartAtSelect()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-base font-normal text-gray-800 block mb-2">结束于</label>
                      <div className="flex items-center">
                        {renderEndAtSelect()}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
