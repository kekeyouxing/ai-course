"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AvatarElement } from "@/types/scene"
import { getAvatars, Avatar } from "@/api/avatar"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AvatarContentProps {
  onSelectAvatar?: (avatarSrc: string, avatarName: string) => void
  avatarElement?: AvatarElement | null
  currentSceneId?: string
}

export default function AvatarContent({
  onSelectAvatar, 
}: AvatarContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)
  const [customAvatars, setCustomAvatars] = useState<Avatar[]>([])
  const [systemAvatars, setSystemAvatars] = useState<Avatar[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("system") // 默认显示系统头像

  // 获取头像列表
  useEffect(() => {
    const fetchAvatars = async () => {
      setLoading(true)
      try {
        const result = await getAvatars()
        if (result.code === 0 && result.data) {
          setCustomAvatars(result.data.customAvatars || [])
          setSystemAvatars(result.data.systemAvatars || [])
        } else {
          toast.error(result.msg || '获取头像列表失败')
        }
      } catch (error) {
        console.error('获取头像列表出错:', error)
        toast.error('获取头像列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchAvatars()
  }, [])

  // 根据当前选中的标签页和搜索关键词过滤头像
  const getFilteredAvatars = () => {
    const avatars = activeTab === "custom" ? customAvatars : systemAvatars
    return avatars.filter(
      (avatar) => avatar.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const filteredAvatars = getFilteredAvatars()

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatarId(avatar.avatarId)
    if (onSelectAvatar) {
      onSelectAvatar(avatar.url, avatar.name)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg">
      
      {/* 搜索框 */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="搜索头像名称..."
          className="pl-10 py-2 w-full border border-gray-200 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* 标签页切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="system">系统头像</TabsTrigger>
          <TabsTrigger value="custom">我的头像</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* 头像网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          // 加载状态
          Array(6).fill(0).map((_, index) => (
            <div 
              key={index} 
              className="bg-gray-200 rounded-lg aspect-square animate-pulse"
            />
          ))
        ) : filteredAvatars.length > 0 ? (
          // 显示头像列表
          filteredAvatars.map((avatar) => (
            <div 
              key={avatar.avatarId}
              className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                selectedAvatarId === avatar.avatarId ? "ring-2 ring-blue-500 scale-95" : "hover:scale-95"
              }`}
              onClick={() => handleAvatarSelect(avatar)}
            >
              <img 
                src={avatar.url} 
                alt={avatar.name}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-sm font-medium">{avatar.name}</p>
              </div>
            </div>
          ))
        ) : (
          // 无数据状态
          <div className="col-span-3 py-8 text-center text-gray-500">
            {activeTab === "custom" ? "暂无自定义头像" : "暂无系统头像"}
          </div>
        )}
      </div>
      
      {/* 自定义头像为空时的提示 */}
      {activeTab === "custom" && customAvatars.length === 0 && !loading && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-2">您还没有自定义头像</p>
          <p className="text-gray-500 text-sm">可以通过上传图片创建自己的头像</p>
        </div>
      )}
    </div>
  )
}

