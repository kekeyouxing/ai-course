"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ChevronDown,
    MicIcon,
    RefreshCw,
    Search,
    Filter,
    Mic
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// 默认声音数据
const defaultVoices = [
    { id: 1, name: "Aaori", language: "Marathi (India)", flag: "🇮🇳" },
    { id: 2, name: "Aaron", language: "28 languages", flag: "🌐" },
    { id: 3, name: "Abbi", language: "British English", flag: "🇬🇧" },
    { id: 4, name: "Abdullah", language: "Arabic (Oman)", flag: "🇴🇲" },
    { id: 5, name: "Abeo", language: "English (Nigeria)", flag: "🇳🇬" },
    { id: 6, name: "Abril", language: "European Spanish", flag: "🇪🇸" },
    { id: 7, name: "Achara", language: "Thai (Thailand)", flag: "🇹🇭" },
    { id: 8, name: "Ada", language: "American English", flag: "🇺🇸" },
    { id: 9, name: "Adam Stone", language: "28 languages", flag: "🌐" },
    { id: 10, name: "Adri", language: "Afrikaans (South Africa)", flag: "🇿🇦" },
    { id: 11, name: "Adrian", language: "28 languages", flag: "🌐" },
];

export default function VideoLabPage() {
    const [activeTab, setActiveTab] = useState("default");
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    return (
        <div className="container mx-auto py-6 max-w-6xl">
            {/* 顶部克隆声音卡片 */}
            <div
                onClick={() => window.location.href = '/clone'}
                className=" rounded-xl p-6 w-80 flex flex-col bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center">
                        <div className="text-white/90 text-sm flex items-center">
                        </div>
                    </div>
                </div>
                <div className="mt-auto">
                    <h3 className="text-2xl font-bold text-white mb-2">创建虚拟形象</h3>
                    <p className="text-white/90">录制一段30秒的视频，并用你的声音为所有角色和旁白配音</p>
                </div>
            </div>

            {/* 主要内容区域 */}
            <Tabs defaultValue="default" className="space-y-6 pt-8" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="custom">自定义形象</TabsTrigger>
                    <TabsTrigger value="default">系统形象</TabsTrigger>
                </TabsList>

                {/* 自定义声音 */}
                <TabsContent value="custom" className="mt-4">
                    <div className="text-gray-500 italic text-center py-8">
                        您还没有创建虚拟形象
                    </div>
                </TabsContent>

                {/* 默认声音 */}
                <TabsContent value="default" className="mt-4">
                    {/* 筛选器 */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <span>Accent</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>American</DropdownMenuItem>
                                    <DropdownMenuItem>British</DropdownMenuItem>
                                    <DropdownMenuItem>Australian</DropdownMenuItem>
                                    <DropdownMenuItem>Indian</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <span>Gender</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Male</DropdownMenuItem>
                                    <DropdownMenuItem>Female</DropdownMenuItem>
                                    <DropdownMenuItem>Non-binary</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <span>Age</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Young</DropdownMenuItem>
                                    <DropdownMenuItem>Middle-aged</DropdownMenuItem>
                                    <DropdownMenuItem>Senior</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <span>Other</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Professional</DropdownMenuItem>
                                    <DropdownMenuItem>Casual</DropdownMenuItem>
                                    <DropdownMenuItem>Energetic</DropdownMenuItem>
                                    <DropdownMenuItem>Calm</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search voices..."
                                className="pl-9 w-[200px]"
                            />
                        </div>
                    </div>

                    {/* 声音列表 */}
                    <div className="grid grid-cols-3 gap-4">
                        {defaultVoices.map((voice) => (
                            <div
                                key={voice.id}
                                className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl">{voice.flag}</span>
                                    <div>
                                        <h3 className="font-medium">{voice.name}</h3>
                                        <p className="text-sm text-gray-500">{voice.language}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}