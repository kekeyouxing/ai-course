"use client"

import { useRef, useState } from "react"  // 移除 useState
import { Mic, Play, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CustomEditor from "@/components/script/custom-editor"
import TimePicker from "@/components/script/time-picker"
// 移除 AnimationPicker 导入

interface Avatar {
  id: string
  name: string
  country: string
}

// 添加 props 类型
interface ScriptContentProps {
  script: string;
  setScript: (script: string) => void;
}

export default function ScriptContent({ script, setScript }: ScriptContentProps) {
  // 移除内部的 script 状态
  // const [script, setScript] = useState<string>( ... )

  const avatars: Avatar[] = [
    { id: "1", name: "Zoe", country: "US" },
    { id: "2", name: "Emma", country: "UK" },
    { id: "3", name: "Liu", country: "CN" },
    { id: "4", name: "Carlos", country: "ES" },
  ]

  const [selectedAvatar, setSelectedAvatar] = useState<string>("1")
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timeValue, setTimeValue] = useState(3)
  // 移除动画选择器相关状态
  const editorRef = useRef<{ 
    insertTimeTag: (seconds: number) => void,
    insertAnimationTag: () => void 
  }>(null)
  
  // 添加插入动画标记函数
  const insertAnimationTag = () => {
    if (editorRef.current) {
      editorRef.current.insertAnimationTag()
    }
  }

  const handleTimePickerToggle = () => {
    setShowTimePicker(!showTimePicker)
  }

  // 移除动画选择器切换函数

  // 插入时间标记
  const insertTimeTag = () => {
    // 直接调用 CustomEditor 的方法
    if (editorRef.current) {
      editorRef.current.insertTimeTag(timeValue)
      setShowTimePicker(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="p-4 flex flex-col gap-4 h-[calc(100vh-180px)] min-h-[550px] border rounded-lg bg-white">
        {/* Top: Avatar Selection Dropdown */}
        <div className="flex items-center gap-2">
          <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
            <SelectTrigger className="w-[180px] border-2 rounded-full">
              <SelectValue placeholder="Select avatar">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                    <Mic className="w-3 h-3 text-primary" />
                  </div>
                  {avatars.find((a) => a.id === selectedAvatar) &&
                    `${avatars.find((a) => a.id === selectedAvatar)?.country} - ${avatars.find((a) => a.id === selectedAvatar)?.name}`}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {avatars.map((avatar) => (
                <SelectItem key={avatar.id} value={avatar.id}>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                      <Mic className="w-3 h-3 text-primary" />
                    </div>
                    {`${avatar.country} - ${avatar.name}`}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Middle: Script Input Area - 使用自定义编辑器 */}
        <div className="flex-1 border rounded-md">
          <CustomEditor
            ref={editorRef}
            value={script}
            onChange={setScript}
            className="h-full"
          />
        </div>

        {/* Bottom: Control Buttons */}
        <div className="flex justify-center mt-auto">
          <div className="flex items-center gap-3 bg-background border rounded-full px-4 py-1.5">
            <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 h-8 w-8 p-0">
              <Sparkles className="h-4 w-4" />
            </Button>
            
            <TimePicker
              value={timeValue}
              onChange={setTimeValue}
              onInsert={insertTimeTag}
              isOpen={showTimePicker}
              onToggle={handleTimePickerToggle}
            />
            
            {/* 替换 AnimationPicker 为简单的按钮 */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full hover:bg-primary/10 h-8 w-8 p-0"
              onClick={insertAnimationTag}
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            
            <div className="h-5 w-px bg-border" />
            <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/10 h-8 w-8 p-0">
              <Play className="h-4 w-4 fill-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

