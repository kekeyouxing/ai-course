"use client"

import { useEffect, useState } from "react"
import { RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { ImageElement } from "@/types/scene"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 组件属性接口
interface ImageContentProps {
  imageElement?: ImageElement;
  onUpdate: (updates: Partial<ImageElement>) => void;
  onDelete: () => void; // 添加删除函数属性
  sceneId?: string; // 添加场景ID属性
}

import { AnimationMarker } from "@/types/animation"
import { getSceneAnimationMarkers } from "@/api/animation"

export default function ImageContent({ imageElement, onUpdate, onDelete, sceneId }: ImageContentProps) {
  const [activeTab, setActiveTab] = useState("format")
  // 添加动画标记状态
  const [animationMarkers, setAnimationMarkers] = useState<AnimationMarker[]>([])
  const [loadingMarkers, setLoadingMarkers] = useState(false)
  
  // 创建一个函数用于获取动画标记
  const fetchAnimationMarkers = async () => {
    if (!sceneId) return;
    
    setLoadingMarkers(true);
    try {
      const result = await getSceneAnimationMarkers(sceneId);
      if (result.code === 0 && result.data?.markers) {
        setAnimationMarkers(result.data.markers);
      }
    } catch (error) {
      console.error("获取动画标记失败:", error);
    } finally {
      setLoadingMarkers(false);
    }
  };
  useEffect(() => {
    if (sceneId) {
      fetchAnimationMarkers();
    }
    // 只依赖 sceneId，避免不必要的重复请求
  }, [sceneId]);
  // 处理标签切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

  };

  // 处理旋转变化
  const handleRotationChange = (value: number[]) => {
    onUpdate({ rotation: value[0] })
  }

  // 处理布局变化
  const handleLayoutChange = (property: keyof ImageElement, value: number) => {
    // 确保所有布局属性都是整数
    const roundedValue = Math.round(value);
    onUpdate({ [property]: roundedValue })
  }

  // 处理动画类型变化
  const handleAnimationTypeChange = (value: string) => {
    const updates: Partial<ImageElement> = { 
      animationType: value as "none" | "fade" | "slide" 
    };
    
    // 如果类型为none，清空开始和结束动画标记ID
    if (value === "none") {
      updates.startAnimationMarkerId = undefined;
      updates.endAnimationMarkerId = undefined;
    }
    
    onUpdate(updates);
  }

  if (!imageElement) {
    return <div className="p-4">请先选择一个图片元素</div>
  }

  // 修改开始时间和结束时间的下拉选择器
  const renderStartAtSelect = () => (
    <Select
      value={imageElement?.startAnimationMarkerId || "default"}
      onValueChange={(value) => {
        if (value === "default") {
          onUpdate({ startAnimationMarkerId: undefined });
        } else {
          // 当设置开始标记时，需要确保动画行为是正确的
          // 如果当前是"exit"，需要改为"both"，因为现在有了开始标记
          const updates: Partial<ImageElement> = { 
            startAnimationMarkerId: value 
          };
          
          if (imageElement.animationBehavior === "exit") {
            updates.animationBehavior = "both";
          } else if (!imageElement.animationBehavior) {
            // 如果没有设置动画行为，则设为"enter"
            updates.animationBehavior = "enter";
          }
          
          onUpdate(updates);
        }
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="选择时间" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">无</SelectItem>
        {animationMarkers.map(marker => {
          // 将暂停标记替换为格式化的文本，但保留原始文本结构
          const parts = marker.description.split(/(<#\d+#>)/g);
          
          return (
            <SelectItem key={marker.id} value={marker.id}>
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  动画
                </span>
                <span className="truncate">
                  {parts.map((part, index) => {
                    const pauseMatch = part.match(/<#(\d+)#>/);
                    if (pauseMatch) {
                      return (
                        <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                          暂停{pauseMatch[1]}秒
                        </span>
                      );
                    }
                    return part;
                  })}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  const renderEndAtSelect = () => (
    <Select
      value={imageElement?.endAnimationMarkerId || "default"}
      onValueChange={(value) => {
        if (value === "default") {
          onUpdate({ endAnimationMarkerId: undefined });
        } else {
          // 当设置结束标记时，需要确保动画行为是正确的
          // 如果当前是"enter"，需要改为"both"，因为现在有了结束标记
          const updates: Partial<ImageElement> = { 
            endAnimationMarkerId: value 
          };
          
          if (imageElement.animationBehavior === "enter") {
            updates.animationBehavior = "both";
          } else if (!imageElement.animationBehavior) {
            // 如果没有设置动画行为，则设为"exit"
            updates.animationBehavior = "exit";
          }
          
          onUpdate(updates);
        }
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="选择时间" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">无</SelectItem>
        {animationMarkers.map(marker => {
          // 将暂停标记替换为格式化的文本，但保留原始文本结构
          const parts = marker.description.split(/(<#\d+#>)/g);
          
          return (
            <SelectItem key={marker.id} value={marker.id}>
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  动画
                </span>
                <span className="truncate">
                  {parts.map((part, index) => {
                    const pauseMatch = part.match(/<#(\d+)#>/);
                    if (pauseMatch) {
                      return (
                        <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                          暂停{pauseMatch[1]}秒
                        </span>
                      );
                    }
                    return part;
                  })}
                </span>
              </div>
            </SelectItem>
          );
        })}
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
                src={imageElement.src}
                alt="图片预览"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* 预览文本部分 */}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-normal">
                  {"图片元素"}
                </h2>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={onDelete}
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
            onClick={() => handleTabChange("format")}
            className={`text-base font-normal py-3 focus:outline-none transition-colors ${
              activeTab === "format" ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
            }`}
          >
            格式
          </button>
          <button
            onClick={() => handleTabChange("animate")}
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
                    <span className="text-sm font-medium w-8 text-right">{imageElement.rotation || 0}°</span>
                  </div>
                </div>
                <div className="px-1 py-2">
                  <Slider
                    value={[imageElement.rotation || 0]}
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
                      value={imageElement.x || 0}
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
                      value={imageElement.y || 0}
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
                      value={imageElement.width || 0}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                        handleLayoutChange("width", value);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 mb-1">高</div>
                    <Input
                      type="text"
                      value={imageElement.height || 0}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value) || 0;
                        handleLayoutChange("height", value);
                      }}
                      className="h-8 text-sm"
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
                <Select 
                  value={imageElement.animationType || "none"} 
                  onValueChange={handleAnimationTypeChange}
                >
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

              {/* 只有当动画类型存在且不是"无"时才显示以下选项 */}
              {imageElement.animationType && imageElement.animationType !== "none" && (
                <>
                  {/* Direction - Only for Slide animation */}
                  {imageElement.animationType === "slide" && (
                    <div>
                      <label className="text-base font-normal text-gray-800 block mb-3">方向</label>
                      <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-full p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${imageElement.animationDirection === "right" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => onUpdate({ animationDirection: "right" })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${imageElement.animationDirection === "left" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => onUpdate({ animationDirection: "left" })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5"></path>
                            <path d="m12 19-7-7 7-7"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${imageElement.animationDirection === "down" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => onUpdate({ animationDirection: "down" })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14"></path>
                            <path d="m19 12-7 7-7-7"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${imageElement.animationDirection === "up" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => onUpdate({ animationDirection: "up" })}
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
                        className={`rounded-full py-2 ${imageElement.animationBehavior === "enter" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => onUpdate({ 
                          animationBehavior: "enter",
                          // 进入动画只需要保留开始标记，清除结束标记
                          endAnimationMarkerId: undefined 
                        })}
                      >
                        进入
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full py-2 ${imageElement.animationBehavior === "exit" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => onUpdate({ 
                          animationBehavior: "exit",
                          // 退出动画只需要保留结束标记，清除开始标记
                          startAnimationMarkerId: undefined 
                        })}
                      >
                        退出
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full py-2 ${imageElement.animationBehavior === "both" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => onUpdate({ 
                          animationBehavior: "both" 
                          // 进出动画需要两个标记，不清除任何标记
                        })}
                      >
                        两者
                      </Button>
                    </div>
                  </div>
                  
                  {imageElement.animationBehavior && (imageElement.animationBehavior === "enter" || imageElement.animationBehavior === "both") && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-base font-normal text-gray-800">开始于</label>
                        {renderStartAtSelect()}
                      </div>
                    </div>
                  )}

                  {imageElement.animationBehavior && (imageElement.animationBehavior === "exit" || imageElement.animationBehavior === "both") && (
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