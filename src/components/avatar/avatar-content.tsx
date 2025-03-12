"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface AvatarContentProps {
  onSelectAvatar?: (avatarSrc: string, avatarName: string) => void
}

export default function AvatarContent({ onSelectAvatar }: AvatarContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null)

  const avatars = [
    {
      id: "1",
      name: "Dwane Casual",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%AA%E5%B1%8F2025-03-12%2004.22.34-RyFwLVZ4Z4piVtmwZ24f3T4Wu1eFxt.png",
      category: "商务"
    },
    {
      id: "2",
      name: "Jason",
      image: "/placeholder.svg?height=400&width=400&text=Jason",
      category: "卡通"
    },
    {
      id: "3",
      name: "Jade",
      image: "/placeholder.svg?height=400&width=400&text=Jade",
      category: "卡通"
    },
    {
      id: "4",
      name: "Alex",
      image: "/placeholder.svg?height=400&width=400&text=Alex",
      category: "商务"
    },
    {
      id: "5",
      name: "Emma",
      image: "/placeholder.svg?height=400&width=400&text=Emma",
      category: "卡通"
    },
    {
      id: "6",
      name: "Sofia",
      image: "/placeholder.svg?height=400&width=400&text=Sofia",
      category: "商务"
    },
  ]

  const filteredAvatars = avatars.filter(
    (avatar) => avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                avatar.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAvatarSelect = (avatar: typeof avatars[0]) => {
    setSelectedAvatarId(avatar.id)
    if (onSelectAvatar) {
      onSelectAvatar(avatar.image, avatar.name)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg">
      
      {/* 搜索框 */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="搜索头像名称或类型..."
          className="pl-10 py-2 w-full border border-gray-200 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* 分类标签 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button 
          className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap"
          onClick={() => setSearchQuery("")}
        >
          全部
        </button>
        <button 
          className="px-4 py-1 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700 whitespace-nowrap"
          onClick={() => setSearchQuery("商务")}
        >
          商务风格
        </button>
        <button 
          className="px-4 py-1 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700 whitespace-nowrap"
          onClick={() => setSearchQuery("卡通")}
        >
          卡通风格
        </button>
      </div>
      
      {/* 头像网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-visible">
        {filteredAvatars.map((avatar) => (
          <div 
            key={avatar.id}
            className={`cursor-pointer rounded-lg p-2 transition-all ${
              selectedAvatarId === avatar.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => handleAvatarSelect(avatar)}
          >
            <div className="aspect-square rounded-lg overflow-hidden mb-2">
              <img
                src={avatar.image}
                alt={avatar.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-sm">{avatar.name}</h3>
              <p className="text-xs text-gray-500">{avatar.category}风格</p>
            </div>
          </div>
        ))}
      </div>
      
      {filteredAvatars.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          没有找到匹配的头像，请尝试其他搜索词
        </div>
      )}
    </div>
  )
}

