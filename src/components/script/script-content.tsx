"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import CustomEditor from "@/components/script/custom-editor"
import TimePicker from "@/components/script/time-picker"
import { getVoices } from "@/api/character"
import {
  ClonedVoice,
  SystemVoice,
} from "@/types/character"
import VoiceSelector from "@/components/script/voice-selector"
import { AnimationMarker } from "@/types/animation"
import { getSceneAnimationMarkers, syncSceneScript } from "@/api/animation"

interface ScriptContentProps {
  script: string;
  setScript: (script: string) => void;
  sceneId: string; // 添加场景ID，可选
}

export default function ScriptContent({
  script,
  setScript,
  sceneId
}: ScriptContentProps) {
  // 添加状态来存储从API获取的声音数据
  const [systemVoices, setSystemVoices] = useState<SystemVoice[]>([])
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([])
  const [loading, setLoading] = useState(true)

  // 修改选中声音的状态
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("")
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timeValue, setTimeValue] = useState(3)

  // 添加动画标记状态
  const [animationMarkers, setAnimationMarkers] = useState<AnimationMarker[]>([])
  const [syncingMarkers, setSyncingMarkers] = useState(false)

  const editorRef = useRef<{
    insertTimeTag: (seconds: number) => void,
    insertAnimationTag: (markerId?: string) => { markerId: string, contextText: string } | null,
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

  // 添加获取动画标记的 useEffect
  useEffect(() => {
    const fetchAnimationMarkers = async () => {
      if (!sceneId) return;

      try {
        const result = await getSceneAnimationMarkers(sceneId);
        if (result.code === 0 && result.data?.markers) {
          setAnimationMarkers(result.data.markers);
        }
      } catch (error) {
        console.error("获取动画标记失败:", error);
      }
    };

    fetchAnimationMarkers();
  }, [sceneId]);

  // 添加解析脚本中的动画标记并同步到后端的函数
  const syncAnimationMarkers = async () => {
    if (!sceneId || syncingMarkers) return;

    setSyncingMarkers(true);

    try {
      // 解析脚本中的所有动画标记ID
      const animationTagRegex = /<@animation(?::([a-zA-Z0-9-]+))?@>/g;
      const markers: { id: string, position: number, length: number }[] = [];
      let match;

      // 创建一个新的正则表达式对象，因为exec会修改lastIndex
      while ((match = animationTagRegex.exec(script)) !== null) {
        const markerId = match[1];
        if (markerId) {
          markers.push({
            id: markerId,
            position: match.index,
            length: match[0].length
          });
        }
      }

      // 准备要同步的标记数据
      const markersToSync = markers.map(marker => {
        // 获取标记周围的上下文文本
        const markerEndPos = marker.position + marker.length;
        let contextAfter = "";

        // 检查是否有后续文本
        if (markerEndPos < script.length) {
          // 直接提取后续文本，不做特殊处理
          contextAfter = script.substring(markerEndPos, Math.min(markerEndPos + 30, script.length)).trim();

          // 如果文本太长，截取一部分
          if (contextAfter.length > 15) {
            contextAfter = contextAfter.substring(0, 15) + "...";
          }
        }

        // 使用上下文文本作为描述，如果没有则使用默认描述
        const description = contextAfter || `文本结尾动画`;

        return {
          sceneId: sceneId,
          id: marker.id,
          description: description,
          type: 'animation' as const
        };
      });

      // 调用后端API同步标记和脚本内容
      const result = await syncSceneScript(sceneId, {
        script,
        markers: markersToSync
      });

      if (result.code === 0 && result.data?.markers) {
        setAnimationMarkers(result.data.markers);
      }
    } catch (error) {
      console.error("同步脚本和动画标记失败:", error);
    } finally {
      setSyncingMarkers(false);
    }
  };

  // 当脚本内容变化时，同步动画标记和脚本
  useEffect(() => {
    if (!sceneId) return;

    // 使用防抖，避免频繁同步
    const debounceTimer = setTimeout(() => {
      syncAnimationMarkers();
    }, 1000); // 2000ms的防抖时间

    return () => clearTimeout(debounceTimer);
  }, [script, sceneId]);

  // 修改插入动画标记函数
  const insertAnimationTag = async () => {
    if (!editorRef.current || !sceneId) return;

    editorRef.current.insertAnimationTag();
  };

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
            >
              <Play className="h-4 w-4 fill-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}