"use client"

import { useState, useRef } from "react"
import { Mic, Play, Search, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ClonedVoice, SystemVoice } from "@/types/character"

interface VoiceSelectorProps {
  systemVoices: SystemVoice[]
  clonedVoices: ClonedVoice[]
  selectedVoiceId: string
  onSelectVoice: (voiceId: string) => void
  loading: boolean
}

export default function VoiceSelector({
  systemVoices,
  clonedVoices,
  selectedVoiceId,
  onSelectVoice,
  loading
}: VoiceSelectorProps) {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGender, setSelectedGender] = useState<string>("all")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  
  // 音频播放相关
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // 获取所有可用的语言选项
  const availableLanguages = Array.from(new Set([
    ...systemVoices.map(voice => voice.language),
    ...clonedVoices.map(voice => voice.language)
  ])).filter(Boolean)
  
  // 获取所有可用的性别选项
  const availableGenders = Array.from(new Set([
    ...systemVoices.map(voice => voice.gender),
    ...clonedVoices.map(voice => voice.gender)
  ])).filter(Boolean)
  
  // 筛选声音
  const filterVoices = (voices: any[], type: "system" | "custom") => {
    return voices.filter(voice => {
      const name = type === "system" ? voice.voice_name : voice.name
      const gender = voice.gender || ""
      const language = voice.language || ""
      
      const matchesSearch = searchTerm === "" || 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        language.toLowerCase().includes(searchTerm.toLowerCase())
        
      const matchesGender = selectedGender === "all" || gender === selectedGender
      const matchesLanguage = selectedLanguage === "all" || language === selectedLanguage
      
      return matchesSearch && matchesGender && matchesLanguage
    })
  }
  
  const filteredSystemVoices = filterVoices(systemVoices, "system")
  const filteredClonedVoices = filterVoices(clonedVoices, "custom")
  
  // 获取当前选中的声音
  const selectedVoice = [...clonedVoices, ...systemVoices].find(voice => 
    (voice as any).voice_id === selectedVoiceId
  )
  
  // 获取选中声音的显示名称
  const getSelectedVoiceName = () => {
    if (!selectedVoice) return "选择声音"
    
    const isCloned = 'name' in selectedVoice
    const name = isCloned ? selectedVoice.name : (selectedVoice as SystemVoice).voice_name
    const language = selectedVoice.language || ""
    
    return `${language} - ${name}`
  }
  
  // 处理选择声音
  const handleSelectVoice = (voiceId: string) => {
    onSelectVoice(voiceId)
    setIsVoiceModalOpen(false)
  }
  
  // 处理音频播放
  const handlePlayAudio = (voice: SystemVoice | ClonedVoice) => {
    if (playingVoiceId === voice.voice_id) {
      // 如果当前正在播放，则暂停
      if (audioRef.current) {
        audioRef.current.pause()
        setPlayingVoiceId(null)
      }
    } else {
      // 如果当前没有播放，则播放新的音频
      if (audioRef.current) {
        audioRef.current.pause()
      }

      // 创建新的音频元素
      const audio = new Audio(voice.audio_url)
      audioRef.current = audio

      // 播放结束时重置状态
      audio.onended = () => {
        setPlayingVoiceId(null)
      }

      // 开始播放
      audio.play().catch(error => {
        console.error('音频播放失败:', error)
        setPlayingVoiceId(null)
      })

      setPlayingVoiceId(voice.voice_id)
    }
  }

  return (
    <Dialog open={isVoiceModalOpen} onOpenChange={setIsVoiceModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 rounded-full border-2 h-10 px-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
            <Mic className="w-3 h-3 text-primary" />
          </div>
          <span className="truncate max-w-[140px] font-normal">{getSelectedVoiceName()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>选择声音</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* 搜索和筛选 - 固定在顶部 */}
          <div className="flex flex-wrap gap-2 mb-4 sticky top-0 bg-white pt-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="搜索声音..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="性别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有性别</SelectItem>
                {availableGenders.map(gender => (
                  <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="语言" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有语言</SelectItem>
                {availableLanguages.map(language => (
                  <SelectItem key={language} value={language}>{language}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 声音列表 - 可滚动区域 */}
          <div className="flex-1 overflow-y-auto pr-2">
            <Tabs defaultValue="custom" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 sticky top-0 bg-white z-10">
                <TabsTrigger value="custom">自定义声音</TabsTrigger>
                <TabsTrigger value="system">系统声音</TabsTrigger>
              </TabsList>
              
              <TabsContent value="custom" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : filteredClonedVoices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredClonedVoices.map(voice => (
                      <div 
                        key={voice.voice_id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedVoiceId === voice.voice_id ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectVoice(voice.voice_id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={voice.avatar_url} alt={voice.name} />
                            <AvatarFallback>{voice.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{voice.name}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {voice.language} · {voice.gender}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlayAudio(voice)
                            }}
                          >
                            {playingVoiceId === voice.voice_id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    没有找到匹配的自定义声音
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="system" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : filteredSystemVoices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredSystemVoices.map(voice => (
                      <div 
                        key={voice.voice_id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedVoiceId === voice.voice_id ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectVoice(voice.voice_id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                            <Mic className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{voice.voice_name}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {voice.language} · {voice.gender}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlayAudio(voice)
                            }}
                          >
                            {playingVoiceId === voice.voice_id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    没有找到匹配的系统声音
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}