"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Wand2, Bot, Settings } from "lucide-react"
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
import { textToSpeech, generateScriptFromImageAnalysis } from "@/api/scene"
import AudioPlayer from "@/components/script/audio-player"
import { toast } from "sonner"
import { Scene, Project } from "@/types/scene"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

// 添加语音设置接口
interface VoiceSettings {
  speed: number;
  volume: number;
  pitch: number;
  emotion: string;
}

interface ScriptContentProps {
  scene: Scene;  // 场景对象
  project: Project; // 项目对象
  updateScene: (updates: Partial<Scene>) => void;  // 更新scene的函数
  updateProject: (updates: Partial<Project>) => void;  // 更新project的函数
}

export default function ScriptContent({
  scene,
  project,
  updateScene,
  updateProject
}: ScriptContentProps) {
  // 添加状态来存储从API获取的声音数据
  const [systemVoices, setSystemVoices] = useState<SystemVoice[]>([])
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([])
  const [loading, setLoading] = useState(true)
  const [ttsLoading, setTtsLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false) // 添加AI生成脚本的加载状态
  // 使用project中的language，如果没有则默认为中文
  const [language, setLanguage] = useState<"zh" | "en">(project.language || "zh")

  // 使用project中的voiceId，如果没有则为空字符串
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(project.voiceId || "")
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timeValue, setTimeValue] = useState(3)

  // 添加动画标记状态
  const [animationMarkers, setAnimationMarkers] = useState<AnimationMarker[]>([])
  const [syncingMarkers, setSyncingMarkers] = useState(false)

  // 添加语音设置状态，使用project中的值或默认值
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    speed: project.voiceSpeed || 1.0,
    volume: project.voiceVolume || 1.0,
    pitch: project.voicePitch || 0,
    emotion: project.voiceEmotion || "neutral"
  })

  const editorRef = useRef<{
    insertTimeTag: (seconds: number) => void,
    insertAnimationTag: (markerId?: string) => { markerId: string, contextText: string } | null,
  }>(null)

  // 本地引用script，以便更新
  const script = scene.script || "";

  // 更新脚本的本地函数
  const setScript = (newScript: string) => {
    updateScene({ script: newScript });
  };

  // 只获取声音列表
  useEffect(() => {
    const fetchVoices = async () => {
      setLoading(true)
      const result = await getVoices()
      if (result.success) {
        setSystemVoices(result.systemVoices)
        setClonedVoices(result.clonedVoices)
      }
      setLoading(false)
    }

    fetchVoices()
  }, []) // 空依赖数组，只在组件挂载时获取

  // 处理选择声音逻辑
  useEffect(() => {
    if (project.voiceId) {
      setSelectedVoiceId(project.voiceId);
    } else if (clonedVoices.length > 0) {
      setSelectedVoiceId(clonedVoices[0].voice_id);
      updateProject({ voiceId: clonedVoices[0].voice_id });
    } else if (systemVoices.length > 0) {
      setSelectedVoiceId(systemVoices[0].voice_id);
      updateProject({ voiceId: systemVoices[0].voice_id });
    }
  }, [project.voiceId, clonedVoices, systemVoices, updateProject])

  // 添加获取动画标记的 useEffect
  useEffect(() => {
    const fetchAnimationMarkers = async () => {
      if (!scene.id) return;

      try {
        const result = await getSceneAnimationMarkers(scene.id);
        if (result.code === 0 && result.data?.markers) {
          setAnimationMarkers(result.data.markers);
        }
      } catch (error) {
        console.error("获取动画标记失败:", error);
      }
    };

    fetchAnimationMarkers();
  }, [scene.id]);

  // 添加解析脚本中的动画标记并同步到后端的函数
  const syncAnimationMarkers = async () => {
    if (!scene.id || syncingMarkers) return;

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
          sceneId: scene.id,
          id: marker.id,
          description: description,
          type: 'animation' as const
        };
      });

      // 调用后端API同步标记和脚本内容
      const result = await syncSceneScript(scene.id, {
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
    if (!scene.id) return;

    // 使用防抖，避免频繁同步
    const debounceTimer = setTimeout(() => {
      syncAnimationMarkers();
    }, 1000); // 1000ms的防抖时间

    return () => clearTimeout(debounceTimer);
  }, [script, scene.id]);

  // 修改插入动画标记函数
  const insertAnimationTag = async () => {
    if (!editorRef.current || !scene.id) return;

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

  // 文本转语音
  const handleTextToSpeech = async () => {
    if (!scene.id) {
      toast.error("场景ID不能为空");
      return;
    }

    // 检查脚本是否为空
    if (!script || script.trim() === '') {
      toast.error("脚本内容不能为空");
      return;
    }

    // 检查是否选择了声音
    if (!selectedVoiceId) {
      toast.error("请选择一个声音");
      return;
    }

    setTtsLoading(true);
    try {
      const result = await textToSpeech({
        voiceId: selectedVoiceId,
        sceneId: scene.id,
        language: language,
        // 使用语音设置参数
        speed: voiceSettings.speed,
        volume: voiceSettings.volume,
        pitch: voiceSettings.pitch,
        emotion: voiceSettings.emotion
      });

      if (result.code === 0 && result.data) {
        // audioLength已经是毫秒单位，直接使用
        updateScene({
          audioSrc: result.data.audioUrl,
          duration: result.data.audioLength
        });
      } else {
        toast.error(result.msg || "文本转语音失败");
      }
    } catch (error) {
      console.error("文本转语音出错:", error);
      toast.error("文本转语音失败，请稍后再试");
    } finally {
      setTtsLoading(false);
    }
  };

  // AI生成脚本函数
  const handleGenerateScript = async () => {
    if (!scene.id) {
      toast.error("场景ID不能为空");
      return;
    }

    setAiGenerating(true);
    try {
      // 调用图像分析API生成脚本
      const result = await generateScriptFromImageAnalysis({
        sceneId: scene.id,
        language: language,
      });

      if (result.code === 0 && result.data?.result) {
        // 更新脚本内容
        updateScene({ script: result.data.result });
      } else {
        toast.error(result.msg || "生成脚本失败");
      }
    } catch (error) {
      console.error("生成脚本出错:", error);
      toast.error("生成脚本失败，请稍后再试");
    } finally {
      setAiGenerating(false);
    }
  };

  // 处理语音设置更改，同时更新项目级别的设置
  const handleVoiceSettingChange = (setting: keyof VoiceSettings, value: any) => {
    setVoiceSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // 更新项目级别的设置
    switch (setting) {
      case 'speed':
        updateProject({ voiceSpeed: value });
        break;
      case 'volume':
        updateProject({ voiceVolume: value });
        break;
      case 'pitch':
        updateProject({ voicePitch: value });
        break;
      case 'emotion':
        updateProject({ voiceEmotion: value });
        break;
    }
  };

  // 修改语言选择的处理函数，同时更新project
  const handleLanguageChange = (value: "zh" | "en") => {
    setLanguage(value);
    // 更新项目的language字段
    updateProject({ language: value });
  };

  // 修改声音选择的处理函数，同时更新project
  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    // 更新项目的voiceId字段
    updateProject({ voiceId: voiceId });
  };

  // 当项目变化时，更新语言状态
  useEffect(() => {
    if (project.language) {
      setLanguage(project.language);
    }
  }, [project.id, project.language]);

  // 当项目变化时，更新声音ID状态
  useEffect(() => {
    if (project.voiceId) {
      setSelectedVoiceId(project.voiceId);
    }
  }, [project.id, project.voiceId]);

  // 当项目变化时，更新语音设置状态
  useEffect(() => {
    setVoiceSettings({
      speed: project.voiceSpeed || 1.0,
      volume: project.voiceVolume || 1.0,
      pitch: project.voicePitch || 0,
      emotion: project.voiceEmotion || "neutral"
    });
  }, [project.voiceSpeed, project.voiceVolume, project.voicePitch, project.voiceEmotion]);

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="p-4 flex flex-col gap-4 h-[calc(100vh-180px)] min-h-[550px] border rounded-lg bg-white">
        {/* Top: 控制按钮从左到右布局 */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div>
                  <VoiceSelector
                    systemVoices={systemVoices}
                    clonedVoices={clonedVoices}
                    selectedVoiceId={selectedVoiceId}
                    onSelectVoice={handleVoiceChange}
                    loading={loading}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>选择配音声音</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[80px] h-10 rounded-full">
                    <SelectValue placeholder="语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="en">英语</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>
                <p>选择脚本语言</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-10 flex items-center gap-1 px-3"
                  onClick={handleGenerateScript}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-1" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>智能生成{language === "zh" ? "中文" : "英语"}脚本</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Middle: Script Input Area - 使用自定义编辑器 */}
        <div className="flex-1 border rounded-md overflow-hidden custom-editor-container" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <CustomEditor
            ref={editorRef}
            value={script}
            onChange={setScript}
            className="h-full overflow-y-auto"
          />
        </div>

        {/* Bottom: Control Buttons */}
        <div className="flex justify-center mt-auto">
          <div className="flex items-center gap-3 bg-background border rounded-full px-4 py-1">

            <TimePicker
              value={timeValue}
              onChange={setTimeValue}
              onInsert={insertTimeTag}
              isOpen={showTimePicker}
              onToggle={handleTimePickerToggle}
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full hover:bg-primary/10 h-8 w-8 p-0"
                    onClick={insertAnimationTag}
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>插入动画标记</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="h-5 w-px bg-border" />

            {/* 设置按钮及弹出框 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full hover:bg-primary/10 h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">语音设置</h4>
                        
                        {/* 语速设置 */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="speed">语速</Label>
                            <span className="text-xs text-muted-foreground">{voiceSettings.speed.toFixed(1)}</span>
                          </div>
                          <Slider
                            id="speed"
                            min={0.5}
                            max={2}
                            step={0.1}
                            value={[voiceSettings.speed]}
                            onValueChange={(values) => handleVoiceSettingChange('speed', values[0])}
                          />
                        </div>
                        
                        {/* 音量设置 */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="volume">音量</Label>
                            <span className="text-xs text-muted-foreground">{voiceSettings.volume.toFixed(1)}</span>
                          </div>
                          <Slider
                            id="volume"
                            min={0.1}
                            max={10}
                            step={0.1}
                            value={[voiceSettings.volume]}
                            onValueChange={(values) => handleVoiceSettingChange('volume', values[0])}
                          />
                        </div>
                        
                        {/* 音调设置 */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="pitch">音调</Label>
                            <span className="text-xs text-muted-foreground">{voiceSettings.pitch}</span>
                          </div>
                          <Slider
                            id="pitch"
                            min={-12}
                            max={12}
                            step={1}
                            value={[voiceSettings.pitch]}
                            onValueChange={(values) => handleVoiceSettingChange('pitch', values[0])}
                          />
                        </div>
                        
                        {/* 情绪选择 */}
                        <div className="space-y-2">
                          <Label htmlFor="emotion">情绪</Label>
                          <Select 
                            value={voiceSettings.emotion} 
                            onValueChange={(value) => handleVoiceSettingChange('emotion', value)}
                          >
                            <SelectTrigger id="emotion">
                              <SelectValue placeholder="选择情绪" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="happy">高兴</SelectItem>
                              <SelectItem value="sad">悲伤</SelectItem>
                              <SelectItem value="angry">愤怒</SelectItem>
                              <SelectItem value="fearful">害怕</SelectItem>
                              <SelectItem value="disgusted">厌恶</SelectItem>
                              <SelectItem value="surprised">惊讶</SelectItem>
                              <SelectItem value="neutral">中性</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-primary hover:bg-primary/10 h-8 w-8 p-0"
                    onClick={handleTextToSpeech}
                    disabled={ttsLoading}
                  >
                    {ttsLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Play className="h-4 w-4 fill-primary" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>转换文本为语音</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* 音频播放器 */}
        {scene.audioSrc && (
          <div className="mt-1">
            <AudioPlayer
              audioUrl={scene.audioSrc}
              audioLength={scene.duration || 0}
              autoPlay={true}
              className="w-full"
              key={scene.audioSrc}
            />
          </div>
        )}
      </div>
    </div>
  )
}