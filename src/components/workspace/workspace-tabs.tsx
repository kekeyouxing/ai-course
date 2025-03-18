"use client"

import {
    FileText,
    Image,
    Layers,
    Type,
    User,
} from "lucide-react"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Profile {
    id: string
    name: string
    image: string
}

interface VideoTabsProps {
    tabs: string[]
    activeTab: string
    setActiveTab: (tab: string) => void
    onSelectTextType?: (type: "title" | "subtitle" | "body") => void
}

// 封装文本类型选择的组件
function TextTypeSelector({
    onOpenChange, 
    onSelectType 
}: { 
    isOpen: boolean; 
    onOpenChange: (open: boolean) => void; 
    onSelectType: (type: "title" | "subtitle" | "body") => void 
}) {
    return (
        <PopoverContent className="w-48 p-0" align="start">
            <div className="p-2 space-y-2">
                <button
                    className="w-full p-2 hover:bg-gray-100 rounded flex items-center"
                    onClick={() => {
                        onSelectType("title")
                        onOpenChange(false)
                    }}
                >
                    <span className="text-2xl font-bold">标题</span>
                </button>
                <button
                    className="w-full p-2 hover:bg-gray-100 rounded flex items-center"
                    onClick={() => {
                        onSelectType("subtitle")
                        onOpenChange(false)
                    }}
                >
                    <span className="text-xl font-medium">副标题</span>
                </button>
                <button
                    className="w-full p-2 hover:bg-gray-100 rounded flex items-center"
                    onClick={() => {
                        onSelectType("body")
                        onOpenChange(false)
                    }}
                >
                    <span className="text-base">正文</span>
                </button>
            </div>
        </PopoverContent>
    )
}

export function VideoTabs({ tabs, activeTab, setActiveTab, onSelectTextType }: VideoTabsProps) {
    const [isTextPopoverOpen, setIsTextPopoverOpen] = useState(false)

    const handleTabClick = (tab: string) => {
        setActiveTab(tab)
        
        // 如果点击的是 Text 标签，打开弹出框
        if (tab === "Text" && onSelectTextType) {
            setIsTextPopoverOpen(true)
        }
    }

    return (
        <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
                tab === "Text" && onSelectTextType ? (
                    <Popover key={tab} open={isTextPopoverOpen && activeTab === "Text"} onOpenChange={setIsTextPopoverOpen}>
                        <PopoverTrigger asChild>
                            <button
                                className={`flex flex-col items-center px-4 py-2 text-xs ${activeTab === tab ? "border-b-2 border-black" : "text-gray-500"}`}
                                onClick={() => handleTabClick(tab)}
                            >
                                <Type className="h-5 w-5 mb-1" />
                                {tab}
                            </button>
                        </PopoverTrigger>
                        <TextTypeSelector 
                            isOpen={isTextPopoverOpen} 
                            onOpenChange={setIsTextPopoverOpen} 
                            onSelectType={onSelectTextType} 
                        />
                    </Popover>
                ) : (
                    <button
                        key={tab}
                        className={`flex flex-col items-center px-4 py-2 text-xs ${activeTab === tab ? "border-b-2 border-black" : "text-gray-500"}`}
                        onClick={() => handleTabClick(tab)}
                    >
                        {tab === "Script" && <FileText className="h-5 w-5 mb-1" />}
                        {tab === "Avatar" && <User className="h-5 w-5 mb-1" />}
                        {tab === "Background" && <Layers className="h-5 w-5 mb-1" />}
                        {tab === "Media" && <Image className="h-5 w-5 mb-1" />}
                        {tab}
                    </button>
                )
            ))}
        </div>
    )
}