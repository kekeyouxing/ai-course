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

type TextAlignment = "left" | "center" | "right"
// 定义文本元素接口
interface TextElement {
  content: string;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: TextAlignment;
  rotation?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// 组件属性接口
interface TextContentProps {
  textElement?: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
}

export default function TextContent({ textElement, onUpdate }: TextContentProps) {
  const [activeTab, setActiveTab] = useState("format")
  const [textAlignment, setTextAlignment] = useState<TextAlignment>(textElement?.alignment || "left")
  const [fontColor, setFontColor] = useState(textElement?.fontColor || "#000000")
  const [backgroundColor, setBackgroundColor] = useState(textElement?.backgroundColor || "rgba(255, 255, 255, 0)")
  const [boldActive, setBoldActive] = useState(textElement?.bold || false)
  const [italicActive, setItalicActive] = useState(textElement?.italic || false)
  const [rotation, setRotation] = useState(textElement?.rotation || 0)
  const [layout, setLayout] = useState({
    x: textElement?.x || 0,
    y: textElement?.y || 0,
    width: textElement?.width || 100,
    height: textElement?.height || 100,
  })
  const [fontFamily, setFontFamily] = useState(textElement?.fontFamily || "lora")
  const [fontSize, setFontSize] = useState(textElement?.fontSize?.toString() || "24")

  // 字体大小预设选项
  const fontSizeOptions = [18, 24, 32, 36, 48, 56, 64, 72, 96, 120, 144, 180, 210, 225, 240];

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
    setLayout(prev => {
      const newLayout = { ...prev, [property]: value }
      onUpdate({ [property]: value })
      return newLayout
    })
  }

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
        width: textElement.width || 100,
        height: textElement.height || 100,
      });
      setFontFamily(textElement.fontFamily || "lora");
      setFontSize(textElement.fontSize?.toString() || "24");
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
    <div className="w-full max-w-md mx-auto overflow-hidden bg-white">
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
            onClick={() => setActiveTab("format")}
            className={`text-base font-normal py-3 focus:outline-none transition-colors ${
              activeTab === "format" ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
            }`}
          >
            Format
          </button>
          <button
            onClick={() => setActiveTab("animate")}
            className={`text-base font-normal py-3 focus:outline-none transition-colors ${
              activeTab === "animate" ? "bg-white border-b-2 border-black font-medium" : "hover:bg-gray-200"
            }`}
          >
            Animate
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
                    <SelectItem value="lora">Lora</SelectItem>
                    <SelectItem value="arial">Arial</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
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
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 absolute right-0 top-0 rounded-l-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-28 p-0" align="end" alignOffset={0} sideOffset={5}>
                      <div className="max-h-[200px] overflow-auto">
                        {fontSizeOptions.map((size) => (
                          <Button
                            key={size}
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
                <label className="text-base font-normal text-gray-800">Font color</label>
                <Popover>
                  <PopoverTrigger asChild>
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
                <label className="text-base font-normal text-gray-800">Background color</label>
                <Popover>
                  <PopoverTrigger asChild>
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
                  <label className="text-base font-normal text-gray-800">Rotation</label>
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
                <label className="text-base font-normal text-gray-800 block mb-2">Layout</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">X</div>
                    <Input
                      type="number"
                      value={layout.x}
                      onChange={(e) => handleLayoutChange("x", Number.parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Y</div>
                    <Input
                      type="number"
                      value={layout.y}
                      onChange={(e) => handleLayoutChange("y", Number.parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">W</div>
                    <Input
                      type="number"
                      value={layout.width}
                      onChange={(e) => handleLayoutChange("width", Number.parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">H</div>
                    <Input
                      type="number"
                      value={layout.height}
                      onChange={(e) => handleLayoutChange("height", Number.parseInt(e.target.value) || 0)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Order */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">Order</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-md">
                    <div className="h-4 w-4 border-2 border-gray-500 bg-gray-100"></div>
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-md">
                    <div className="h-4 w-4 border-2 border-gray-500 bg-gray-100 relative">
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-gray-500 rounded-sm"></div>
                    </div>
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-md">
                    <div className="h-4 w-4 border-2 border-dashed border-gray-500"></div>
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-md">
                    <div className="h-4 w-4 border-2 border-gray-500 bg-gray-200"></div>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Animate Tab Content */}
          {activeTab === "animate" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">Animation type</label>
                <Select defaultValue="none">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select animation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="bounce">Bounce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

