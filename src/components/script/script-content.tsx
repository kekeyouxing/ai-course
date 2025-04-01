"use client"

import { useEffect, useRef, useState } from "react"
import {Play, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import CustomEditor from "@/components/script/custom-editor"
import TimePicker from "@/components/script/time-picker"
import { getVoices } from "@/api/character"
import {
  ClonedVoice,
  SystemVoice,
} from "@/types/character"
import VoiceSelector from "@/components/script/voice-selector"

interface ScriptContentProps {
  script: string;
  setScript: (script: string) => void;
}

export default function ScriptContent({ script, setScript }: ScriptContentProps) {
  // 添加状态来存储从API获取的声音数据
  const [systemVoices, setSystemVoices] = useState<SystemVoice[]>([])
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([])
  const [loading, setLoading] = useState(true)
  
  // 修改选中声音的状态
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("")
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timeValue, setTimeValue] = useState(3)
  
  const editorRef = useRef<{
    insertTimeTag: (seconds: number) => void,
    insertAnimationTag: () => void,
    printContentTree: () => void  // 添加新方法
  }>(null)

  // 添加获取声音数据的 useEffect
  useEffect(() => {
    const fetchVoices = async () => {
      setLoading(true)
      const result = await getVoices()
      if (result.success) {
        setSystemVoices(result.systemVoices)
        setClonedVoices(result.clonedVoices)
        
        // 如果有自定义声音，默认选择第一个，否则选择第一个系统声音
        if (result.clonedVoices.length > 0) {
          setSelectedVoiceId(result.clonedVoices[0].voice_id)
        } else if (result.systemVoices.length > 0) {
          setSelectedVoiceId(result.systemVoices[0].voice_id)
        }
      }
      setLoading(false)
    }
    
    fetchVoices()
  }, [])

  // 添加插入动画标记函数
  const insertAnimationTag = () => {
    if (editorRef.current) {
      editorRef.current.insertAnimationTag()
    }
  }

  const handleTimePickerToggle = () => {
    setShowTimePicker(!showTimePicker)
  }

  // 插入时间标记
  const insertTimeTag = () => {
    if (editorRef.current) {
      editorRef.current.insertTimeTag(timeValue)
      setShowTimePicker(false)
    }
  }

  // 添加打印内容树的函数
  const handlePrintContentTree = () => {
    if (editorRef.current && editorRef.current.printContentTree) {
      editorRef.current.printContentTree();
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="p-4 flex flex-col gap-4 h-[calc(100vh-180px)] min-h-[550px] border rounded-lg bg-white">
        {/* Top: Voice Selection Button */}
        <div className="flex items-center gap-2">
          <VoiceSelector
            systemVoices={systemVoices}
            clonedVoices={clonedVoices}
            selectedVoiceId={selectedVoiceId}
            onSelectVoice={setSelectedVoiceId}
            loading={loading}
          />
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

            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-primary/10 h-8 w-8 p-0"
              onClick={insertAnimationTag}
            >
              <Wand2 className="h-4 w-4" />
            </Button>

            <div className="h-5 w-px bg-border" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full text-primary hover:bg-primary/10 h-8 w-8 p-0"
              onClick={handlePrintContentTree}
            >
              <Play className="h-4 w-4 fill-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}