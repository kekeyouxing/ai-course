"use client"

import { useEffect, useState } from "react"
import { Bold, Italic, RotateCcw, Type } from "lucide-react"
import { HexColorPicker, RgbaColor, RgbaColorPicker } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import "./color-picker.css" // 导入自定义样式
import { TextElement, TextAlignment } from "@/types/scene"
import { AnimationMarker } from "@/types/animation"
import { getSceneAnimationMarkers } from "@/api/animation"

// 组件属性接口
interface TextContentProps {
  textElement?: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
  sceneId?: string; // 添加场景ID属性
}

export default function TextContent({ textElement, onUpdate, sceneId }: TextContentProps) {
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

  // 处理标签切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // 当切换到动画标签时，获取最新的动画标记
    if (tab === "animate" && sceneId) {
      fetchAnimationMarkers();
    }
  };
  const [textAlignment, setTextAlignment] = useState<TextAlignment>(textElement?.alignment || "left")
  const [fontColor, setFontColor] = useState(textElement?.fontColor || "#000000")
  const [backgroundColor, setBackgroundColor] = useState(textElement?.backgroundColor || "rgba(255, 255, 255, 0)")
  const [boldActive, setBoldActive] = useState(textElement?.bold || false)
  const [italicActive, setItalicActive] = useState(textElement?.italic || false)
  const [rotation, setRotation] = useState(textElement?.rotation || 0)
  const [layout, setLayout] = useState({
    x: textElement?.x || 0,
    y: textElement?.y || 0,
    width: textElement?.width || 0,
    height: textElement?.height || 0,
  })
  const [fontFamily, setFontFamily] = useState(textElement?.fontFamily || "lora")
  const [fontSize, setFontSize] = useState(textElement?.fontSize?.toString() || "24")

  // Animation states
  const [animationType, setAnimationType] = useState(textElement?.animationType || "none")
  const [animationBehavior, setAnimationBehavior] = useState(textElement?.animationBehavior || "enter")
  const [animationDirection, setAnimationDirection] = useState(textElement?.animationDirection || "right")

  // 字体大小预设选项
  const fontSizeOptions = [32, 56, 96, 120, 144, 180, 210, 225, 240];

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
  ]

  const backgroundPresetColors = [
    "#FFFFFF",
    "#F8F9FA",
    "#E9ECEF",
    "#DEE2E6",
    "#CED4DA",
    "#ADB5BD",
    "#6C757D",
    "#495057",
    "#343A40",
    "#212529",
    "#F1F8FF",
    "#E1F0FF",
    "#D1E7FF",
    "#C8E1FF",
    "#79B8FF",
  ]

  // 修改开始时间和结束时间的下拉选择器
  const renderStartAtSelect = () => (
    <Select
      value={textElement?.startAnimationMarkerId || "default"}
      onValueChange={(value) => {
        if (value === "default") {
          onUpdate({ startAnimationMarkerId: undefined });
        } else {
          // 当设置开始标记时，需要确保动画行为是正确的
          const updates: Partial<TextElement> = { startAnimationMarkerId: value };
          
          // 如果当前是退出动画，需要改为"both"
          if (textElement?.animationBehavior === "exit") {
            updates.animationBehavior = "both";
          } else if (!textElement?.animationBehavior) {
            // 如果没有设置动画行为，默认为进入动画
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
      value={textElement?.endAnimationMarkerId || "default"}
      onValueChange={(value) => {
        if (value === "default") {
          onUpdate({ endAnimationMarkerId: undefined });
        } else {
          // 当设置结束标记时，需要确保动画行为是正确的
          const updates: Partial<TextElement> = { endAnimationMarkerId: value };
          
          // 如果当前是进入动画，需要改为"both"
          if (textElement?.animationBehavior === "enter") {
            updates.animationBehavior = "both";
          } else if (!textElement?.animationBehavior) {
            // 如果没有设置动画行为，默认为退出动画
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

  // 处理文本对齐变化
  const handleTextAlignmentChange = (alignment: TextAlignment) => {
    setTextAlignment(alignment)
    onUpdate({ alignment })
  }

  // 处理字体样式变化
  const handleBoldChange = () => {
    const newValue = !boldActive
    setBoldActive(newValue)
    onUpdate({ bold: newValue })
  }

  const handleItalicChange = () => {
    const newValue = !italicActive
    setItalicActive(newValue)
    onUpdate({ italic: newValue })
  }

  // 处理字体选择变化
  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value)
    onUpdate({ fontFamily: value })
  }

  // 处理字体大小变化
  const handleFontSizeChange = (value: string) => {
    setFontSize(value)
    onUpdate({ fontSize: parseInt(value) })
  }

  // 处理颜色变化
  const handleFontColorChange = (color: string) => {
    setFontColor(color)
    onUpdate({ fontColor: color })
  }

  // 解析RGBA字符串为对象
  const parseRgbaString = (rgba: string): RgbaColor => {
    // 默认值
    const defaultColor: RgbaColor = { r: 255, g: 255, b: 255, a: 1 };

    // 如果不是rgba格式，返回默认白色
    if (!rgba.startsWith('rgba(')) {
      return defaultColor;
    }

    // 提取rgba值
    const values = rgba.replace('rgba(', '').replace(')', '').split(',');
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

  const handleBackgroundColorChange = (color: any) => {
    // 如果是rgba对象，转换为rgba字符串
    const rgbaColor = typeof color === 'object' && color.r !== undefined
      ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
      : color;

    setBackgroundColor(rgbaColor)
    onUpdate({ backgroundColor: rgbaColor })
  }

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

  // 处理动画类型变化
  const handleAnimationTypeChange = (value: string) => {
    setAnimationType(value as "none" | "fade" | "slide")
    
    const updates: Partial<TextElement> = { 
      animationType: value as "none" | "fade" | "slide" 
    };
    
    // 如果类型为none，清空开始和结束动画标记ID
    if (value === "none") {
      updates.startAnimationMarkerId = undefined;
      updates.endAnimationMarkerId = undefined;
    }
    
    onUpdate(updates);
  }

  // 处理动画行为变化
  const handleAnimationBehaviorChange = (value: string) => {
    const updates: Partial<TextElement> = {
      animationBehavior: value as "enter" | "exit" | "both"
    };
    
    // 根据动画行为类型管理标记ID
    if (value === "enter") {
      // 进入动画只保留开始标记，清除结束标记
      updates.endAnimationMarkerId = undefined;
    } else if (value === "exit") {
      // 退出动画只保留结束标记，清除开始标记
      updates.startAnimationMarkerId = undefined;
    }
    // 对于"both"，保留两者

    onUpdate(updates);
  }

  // 处理动画方向变化
  const handleAnimationDirectionChange = (value: string) => {
    setAnimationDirection(value as "right" | "left" | "down" | "up")
    onUpdate({ animationDirection: value as "right" | "left" | "down" | "up" })
  }
  // 修改字体列表常量，使用正确的CSS字体名称
  const fontOptions = [
    // 中文字体放在前面
    { value: "'Noto Sans SC', 'Noto Sans CJK SC'", label: "思源黑体" },
    { value: "'Heiti SC', 'Heiti'", label: "黑体" },
    { value: "'Songti SC', 'SimSun', 'STSong'", label: "宋体" },
    { value: "'Yuanti SC', 'STYuanti'", label: "圆体" },
    { value: "'Kaiti SC', 'STKaiti'", label: "楷体" },
    { value: "'Source Han Serif SC', 'Source Han Serif CN'", label: "思源宋体" },
    // 英文字体
    { value: "'Lora', serif", label: "Lora" },
    { value: "'Arial', sans-serif", label: "Arial" },
    { value: "'Roboto', sans-serif", label: "Roboto" },
    { value: "'Helvetica', 'Helvetica Neue', sans-serif", label: "Helvetica" },
    { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
    { value: "'Georgia', serif", label: "Georgia" },
    { value: "'Verdana', sans-serif", label: "Verdana" },
    { value: "'Tahoma', sans-serif", label: "Tahoma" },
  ];
  // 当 textElement 属性变化时更新本地状态
  useEffect(() => {
    if (textElement) {
      setTextAlignment(textElement.alignment || "left");
      setFontColor(textElement.fontColor || "#000000");
      setBackgroundColor(textElement.backgroundColor || "rgba(255, 255, 255, 0)");
      setBoldActive(textElement.bold || false);
      setItalicActive(textElement.italic || false);
      setRotation(textElement.rotation || 0);
      setLayout({
        x: textElement.x || 0,
        y: textElement.y || 0,
        width: textElement.width || 0,
        height: textElement.height || 0,
      });
      setFontFamily(textElement.fontFamily || "lora");
      setFontSize(textElement.fontSize?.toString() || "24");

      // 更新动画状态
      setAnimationType(textElement.animationType || "none");
      setAnimationBehavior(textElement.animationBehavior || "enter");
      setAnimationDirection(textElement.animationDirection || "right");
    }
  }, [textElement]);

  // 如果没有文本元素且有创建文本的回调，显示创建选项
  if (!textElement) {
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
          <Type className="h-6 w-6" />
          <span className="text-lg">文本</span>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="w-full">
        {/* Tab Headers */}
        <div className="grid grid-cols-2 w-full bg-gray-100">
          <button
            onClick={() => handleTabChange("format")}
            className={`text-base font-normal py-3 focus:outline-none transition-colors ${activeTab === "format" ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
              }`}
          >
            格式
          </button>
          <button
            onClick={() => handleTabChange("animate")}
            className={`text-base font-normal py-3 focus:outline-none transition-colors ${activeTab === "animate" ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
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
              {/* Font Family */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">字体</label>
                <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Style */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">字体样式</label>
                <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 rounded-md ${boldActive ? "bg-white shadow-sm" : ""}`}
                    onClick={handleBoldChange}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 rounded-md ${italicActive ? "bg-white shadow-sm" : ""}`}
                    onClick={handleItalicChange}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Font Size */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">字体大小</label>
                <div className="relative w-28">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(e.target.value)}
                    className="h-8 text-sm pr-8"
                  />
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 absolute right-0 top-0 rounded-l-none hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      align="start"
                      className="w-28 p-0"
                      sideOffset={1}
                    >
                      <div className="max-h-[200px] overflow-auto">
                        {fontSizeOptions.map((size) => (
                          <Button
                            key={size}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFontSizeChange(size.toString())}
                            className="w-full justify-start rounded-none text-sm h-8"
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Text Align - 直接在组件内实现，不再使用 TextAlignmentSelector */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">文本对齐</label>
                <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 rounded-md ${textAlignment === "left" ? "bg-white shadow-sm" : ""}`}
                    onClick={() => handleTextAlignmentChange("left")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="17" y1="10" x2="3" y2="10"></line>
                      <line x1="21" y1="6" x2="3" y2="6"></line>
                      <line x1="21" y1="14" x2="3" y2="14"></line>
                      <line x1="17" y1="18" x2="3" y2="18"></line>
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 rounded-md ${textAlignment === "center" ? "bg-white shadow-sm" : ""}`}
                    onClick={() => handleTextAlignmentChange("center")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="10" x2="6" y2="10"></line>
                      <line x1="21" y1="6" x2="3" y2="6"></line>
                      <line x1="21" y1="14" x2="3" y2="14"></line>
                      <line x1="18" y1="18" x2="6" y2="18"></line>
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 rounded-md ${textAlignment === "right" ? "bg-white shadow-sm" : ""}`}
                    onClick={() => handleTextAlignmentChange("right")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="21" y1="10" x2="7" y2="10"></line>
                      <line x1="21" y1="6" x2="3" y2="6"></line>
                      <line x1="21" y1="14" x2="3" y2="14"></line>
                      <line x1="21" y1="18" x2="7" y2="18"></line>
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Font Color */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">颜色</label>
                <Popover>
                  <PopoverTrigger>
                    <Button variant="outline" className="h-8 w-8 p-0 rounded-md">
                      <div
                        className="h-6 w-6 rounded-sm border border-gray-200"
                        style={{ backgroundColor: fontColor }}
                      />
                      <span className="sr-only">Pick a font color</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <div className="mb-3 custom-color-picker">
                      <HexColorPicker color={fontColor} onChange={handleFontColorChange} />
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {presetColors.map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-6 w-6 p-0 rounded-md"
                          style={{ backgroundColor: color }}
                          onClick={() => handleFontColorChange(color)}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Hex</div>
                      <div className="flex h-8 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm items-center">
                        {fontColor}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Background Color */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">背景颜色</label>
                <Popover>
                  <PopoverTrigger>
                    <Button variant="outline" className="h-8 w-8 p-0 rounded-md">
                      <div
                        className="h-6 w-6 rounded-sm border border-gray-200"
                        style={{ backgroundColor: backgroundColor }}
                      />
                      <span className="sr-only">Pick a background color</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <div className="mb-3 custom-color-picker">
                      <RgbaColorPicker
                        color={backgroundColor.startsWith("rgba") ? parseRgbaString(backgroundColor) : { r: 255, g: 255, b: 255, a: 1 }}
                        onChange={handleBackgroundColorChange}
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {backgroundPresetColors.map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-6 w-6 p-0 rounded-md"
                          style={{ backgroundColor: color }}
                          onClick={() => handleBackgroundColorChange(color)}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Color</div>
                      <div className="flex h-8 w-36 rounded-md border border-input bg-background px-3 py-1 text-sm items-center">
                        {backgroundColor}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-base font-normal text-gray-800">旋转</label>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-gray-500" />
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
                <label className="text-base font-normal text-gray-800 block mb-2">位置</label>
                <div className="flex gap-2">
                  <div className="flex-1">
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
                  <div className="flex-1">
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
                  <div className="flex-1">
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
                  <div className="flex-1">
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

