"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AvatarElement } from "@/types/scene"

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
      
      {/* 头像类别 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">头像类别</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-full ${searchQuery === "" ? "bg-blue-100 text-blue-700" : "bg-gray-100"}`}
            onClick={() => setSearchQuery("")}
          >
            全部
          </button>
          <button 
            className={`px-4 py-2 rounded-full ${searchQuery === "商务" ? "bg-blue-100 text-blue-700" : "bg-gray-100"}`}
            onClick={() => setSearchQuery("商务")}
          >
            商务
          </button>
          <button 
            className={`px-4 py-2 rounded-full ${searchQuery === "卡通" ? "bg-blue-100 text-blue-700" : "bg-gray-100"}`}
            onClick={() => setSearchQuery("卡通")}
          >
            卡通
          </button>
        </div>
      </div>
      
      {/* 头像网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAvatars.map((avatar) => (
          <div 
            key={avatar.id}
            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
              selectedAvatarId === avatar.id ? "ring-2 ring-blue-500 scale-95" : "hover:scale-95"
            }`}
            onClick={() => handleAvatarSelect(avatar)}
          >
            <img 
              src={avatar.image} 
              alt={avatar.name}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-white text-sm font-medium">{avatar.name}</p>
              <p className="text-white/80 text-xs">{avatar.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

