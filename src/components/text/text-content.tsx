"use client"

import { useState } from "react"
import { Bold, Italic, RotateCcw, Type } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TextAlignmentSelector } from "@/components//text/text-alignment-selector"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

import "./color-picker.css" // 导入自定义样式

type TextAlignment = "left" | "center" | "right" | "justify"

export default function TextContent() {
  const [activeTab, setActiveTab] = useState("format")
  const [textAlignment, setTextAlignment] = useState<TextAlignment>("left")
  const [fontColor, setFontColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [boldActive, setBoldActive] = useState(false)
  const [italicActive, setItalicActive] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [layout, setLayout] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  })

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

  const handleTextAlignmentChange = (alignment: TextAlignment) => {
    setTextAlignment(alignment)
  }

  const handleLayoutChange = (property: keyof typeof layout, value: number) => {
    setLayout((prev) => ({
      ...prev,
      [property]: value,
    }))
  }

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-100">
        <div className="flex items-center gap-4">
          <Type className="h-6 w-6" />
          <span className="text-lg">Title text</span>
        </div>
        <Button variant="outline" className="rounded-full px-4 py-2">
          Remove
        </Button>
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
                <label className="text-base font-normal text-gray-800">Font family</label>
                <Select defaultValue="lora">
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
                <label className="text-base font-normal text-gray-800">Font style</label>
                <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 rounded-md ${boldActive ? "bg-white shadow-sm" : ""}`}
                    onClick={() => setBoldActive(!boldActive)}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 rounded-md ${italicActive ? "bg-white shadow-sm" : ""}`}
                    onClick={() => setItalicActive(!italicActive)}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Font Size */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">Font size</label>
                <Select defaultValue="225">
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="150">150</SelectItem>
                    <SelectItem value="225">225</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text Align - Using our new component */}
              <div className="flex items-center justify-between">
                <label className="text-base font-normal text-gray-800">Text align</label>
                <TextAlignmentSelector defaultAlignment={textAlignment} onChange={handleTextAlignmentChange} />
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
                      <HexColorPicker color={fontColor} onChange={setFontColor} />
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {presetColors.map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-6 w-6 p-0 rounded-md"
                          style={{ backgroundColor: color }}
                          onClick={() => setFontColor(color)}
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
                      <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {backgroundPresetColors.map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          className="h-6 w-6 p-0 rounded-md"
                          style={{ backgroundColor: color }}
                          onClick={() => setBackgroundColor(color)}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Hex</div>
                      <div className="flex h-8 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm items-center">
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
                    onValueChange={(value) => setRotation(value[0])}
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

