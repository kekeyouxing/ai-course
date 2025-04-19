import React, { useState } from 'react';
import { Square, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ShapeElement, ShapeType } from '@/types/scene';
import { AnimationMarker } from "@/types/animation";
import { getSceneAnimationMarkers } from "@/api/animation";

interface ShapeContentProps {
  shape?: ShapeElement;
  onUpdate: (shape: Partial<ShapeElement>) => void;
  sceneId?: string;
}

// Shape type names in Chinese
const shapeTypeNames: Record<ShapeType, string> = {
  "rectangle": "矩形",
  "circle": "圆形",
  "triangle": "三角形",
  "diamond": "菱形",
  "star": "星形",
  "pentagon": "五边形",
  "hexagon": "六边形",
  "heart": "心形",
  "arrow": "箭头",
  "hollowRectangle": "空心矩形",
  "hollowCircle": "空心圆形",
  "hollowTriangle": "空心三角",
  "hollowStar": "空心星形",
  "pacman": "吃豆人",
  "quarterCircle": "四分之一圆",
  "halfCircle": "半圆",
  "cross": "十字形",
  "trapezoid": "梯形",
  "parallelogram": "平行四边形",
  "rhombus": "菱形",
  "rightArrow": "右箭头",
  "line": "直线"
};

// 预设颜色
const presetColors = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#008000",
  "#800000",
  "#008080",
  "#000080",
  "#808080",
];

export function ShapeContent({ shape, onUpdate, sceneId }: ShapeContentProps) {
  const [activeTab, setActiveTab] = useState("format");
  const [fillColorPickerOpen, setFillColorPickerOpen] = useState(false);
  const [strokeColorPickerOpen, setStrokeColorPickerOpen] = useState(false);
  const [animationMarkers, setAnimationMarkers] = useState<AnimationMarker[]>([]);
  const [loadingMarkers, setLoadingMarkers] = useState(false);

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

  // 处理标签切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // 当切换到动画标签时，获取最新的动画标记
    if (tab === "animate" && sceneId) {
      fetchAnimationMarkers();
    }
  };

  // 处理布局变化，确保与text-content保持一致
  const handleLayoutChange = (property: keyof Pick<ShapeElement, "x" | "y" | "width" | "height">, value: number) => {
    // 确保所有布局属性都是整数，与text-content保持一致的精度处理
    const roundedValue = Math.round(value);
    onUpdate({ [property]: roundedValue });
  };

  // 修改开始时间和结束时间的下拉选择器
  const renderStartAtSelect = () => (
    <Select 
      value={shape?.startAnimationMarkerId || "default"} 
      onValueChange={(value) => {
        onUpdate({ 
          startAnimationMarkerId: value === "default" ? undefined : value 
        });
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="选择动画标记" />
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
      value={shape?.endAnimationMarkerId || "default"} 
      onValueChange={(value) => {
        onUpdate({ 
          endAnimationMarkerId: value === "default" ? undefined : value 
        });
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="选择动画标记" />
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

  // 更新所有handleChange调用
  const handleChange = (update: Partial<ShapeElement>) => {
    onUpdate(update);
  };
  // 如果没有形状元素，显示空白内容
  if (!shape) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
      </div>
    );
  }
  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-100">
        <div className="flex items-center gap-4">
          <Square className="h-6 w-6" />
          <span className="text-lg">形状 - {shape.type ? shapeTypeNames[shape.type] : ''}</span>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="w-full">
        {/* Tab Headers */}
        <div className="grid grid-cols-2 w-full bg-gray-100">
          <button
            onClick={() => handleTabChange("format")}
            className={`text-base font-normal py-3 focus:outline-none transition-colors ${activeTab === "format" ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"}`}
          >
            格式
          </button>
          <button
            onClick={() => handleTabChange("animate")}
            className={`text-base font-normal py-3 focus:outline-none transition-colors ${activeTab === "animate" ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"}`}
          >
            动画
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {/* Format Tab Content */}
          {activeTab === "format" && shape && (
            <div className="space-y-6">
              {/* Fill Color */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">填充颜色</label>
                <Popover open={fillColorPickerOpen} onOpenChange={setFillColorPickerOpen}>
                  <PopoverTrigger>
                    <Button variant="outline" className="h-8 w-8 p-0 rounded-md">
                      <div
                        className="h-6 w-6 rounded-sm border border-gray-200"
                        style={{ backgroundColor: shape.fill }}
                      />
                      <span className="sr-only">选择填充颜色</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <div className="mb-3 custom-color-picker">
                      <HexColorPicker
                        color={shape.fill}
                        onChange={(color) => handleChange({ fill: color })}
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {presetColors.map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-6 w-6 p-0 rounded-md"
                          style={{ backgroundColor: color }}
                          onClick={() => handleChange({ fill: color })}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Hex</div>
                      <div className="flex h-8 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm items-center">
                        {shape.fill}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Stroke Color */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">边框颜色</label>
                <Popover open={strokeColorPickerOpen} onOpenChange={setStrokeColorPickerOpen}>
                  <PopoverTrigger>
                    <Button variant="outline" className="h-8 w-8 p-0 rounded-md">
                      <div
                        className="h-6 w-6 rounded-sm border border-gray-200"
                        style={{ backgroundColor: shape.stroke }}
                      />
                      <span className="sr-only">选择边框颜色</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <div className="mb-3 custom-color-picker">
                      <HexColorPicker
                        color={shape.stroke}
                        onChange={(color) => handleChange({ stroke: color })}
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {presetColors.map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-6 w-6 p-0 rounded-md"
                          style={{ backgroundColor: color }}
                          onClick={() => handleChange({ stroke: color })}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Hex</div>
                      <div className="flex h-8 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm items-center">
                        {shape.stroke}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Stroke Width */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-base font-normal text-gray-800">边框宽度</label>
                  <span className="text-sm font-medium w-8 text-right">{shape.strokeWidth}px</span>
                </div>
                <div className="px-1 py-2">
                  <Slider
                    id="stroke-width-slider"
                    min={0}
                    max={20}
                    step={1}
                    value={[shape.strokeWidth]}
                    onValueChange={([strokeWidth]) => handleChange({ strokeWidth })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-base font-normal text-gray-800">旋转</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => handleChange({ rotation: 0 })}
                      title="重置旋转"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-right">{shape.rotation}°</span>
                  </div>
                </div>
                <div className="px-1 py-2">
                  <Slider
                    value={[shape.rotation]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={([rotation]) => handleChange({ rotation })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Layout - 调整为与text-content完全一致 */}
              <div>
                <label className="text-base font-normal text-gray-800 block mb-2">位置</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">X</div>
                    <Input
                      type="text"
                      value={shape.x}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value) || 0;
                        handleLayoutChange("x", value);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Y</div>
                    <Input
                      type="text"
                      value={shape.y}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value) || 0;
                        handleLayoutChange("y", value);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">宽</div>
                    <Input
                      type="text"
                      value={shape.width}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value) || 0;
                        handleLayoutChange("width", value);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">高</div>
                    <Input
                      type="text"
                      value={shape.height}
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
          {activeTab === "animate" && shape && (
            <div className="space-y-6">
              {/* Animation Type */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">动画类型</label>
                <Select 
                  value={shape.animationType || "none"} 
                  onValueChange={(value) => {
                    const animationType = value as "none" | "fade" | "slide";
                    const updates: Partial<ShapeElement> = { 
                      animationType 
                    };
                    
                    // 如果类型为none，清空开始和结束动画标记ID
                    if (value === "none") {
                      updates.startAnimationMarkerId = undefined;
                      updates.endAnimationMarkerId = undefined;
                    }
                    
                    handleChange(updates);
                  }}
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

              {/* 只有当动画类型不是"无"时才显示以下选项 */}
              {shape.animationType && shape.animationType !== "none" && (
                <>
                  {/* Animation Behavior */}
                  <div>
                    <label className="text-base font-normal text-gray-800 block mb-3">行为</label>
                    <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full py-2 ${shape.animationBehavior === "enter" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => {
                          const updates: Partial<ShapeElement> = { 
                            animationBehavior: "enter" 
                          };
                          // 进入动画只保留开始标记，清除结束标记
                          updates.endAnimationMarkerId = undefined;
                          handleChange(updates);
                        }}
                      >
                        进入
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full py-2 ${shape.animationBehavior === "exit" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => {
                          const updates: Partial<ShapeElement> = { 
                            animationBehavior: "exit" 
                          };
                          // 退出动画只保留结束标记，清除开始标记
                          updates.startAnimationMarkerId = undefined;
                          handleChange(updates);
                        }}
                      >
                        退出
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full py-2 ${shape.animationBehavior === "both" ? "bg-white shadow-sm" : ""}`}
                        onClick={() => {
                          const updates: Partial<ShapeElement> = { 
                            animationBehavior: "both" 
                          };
                          handleChange(updates);
                        }}
                      >
                        两者
                      </Button>
                    </div>
                  </div>

                  {/* Direction - Only for Slide animation */}
                  {shape.animationType === "slide" && (
                    <div>
                      <label className="text-base font-normal text-gray-800 block mb-3">方向</label>
                      <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-full p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${shape.animationDirection === "right" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => handleChange({ animationDirection: "right" })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${shape.animationDirection === "left" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => handleChange({ animationDirection: "left" })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5"></path>
                            <path d="m12 19-7-7 7-7"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${shape.animationDirection === "down" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => handleChange({ animationDirection: "down" })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14"></path>
                            <path d="m19 12-7 7-7-7"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-full py-2 ${shape.animationDirection === "up" ? "bg-white shadow-sm" : ""}`}
                          onClick={() => handleChange({ animationDirection: "up" })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19V5"></path>
                            <path d="m5 12 7-7 7 7"></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Start At and End At animation marker selectors */}
                  {(shape.animationBehavior === "enter" || shape.animationBehavior === "both") && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-base font-normal text-gray-800">开始于</label>
                        {renderStartAtSelect()}
                      </div>
                    </div>
                  )}

                  {(shape.animationBehavior === "exit" || shape.animationBehavior === "both") && (
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
  );
} 