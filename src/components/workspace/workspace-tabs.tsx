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
    // 添加选中元素的类型和清除选中的回调
    selectedElementType?: string | null
    onClearSelection?: () => void
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

export function VideoTabs({ 
    tabs, 
    activeTab, 
    setActiveTab, 
    onSelectTextType,
    selectedElementType,
    onClearSelection
}: VideoTabsProps) {
    const [isTextPopoverOpen, setIsTextPopoverOpen] = useState(false)

    const handleTabClick = (tab: string) => {
        // 如果当前有选中的元素，并且点击的不是对应的标签，则清除选中
        if (selectedElementType && onClearSelection) {
            // 如果选中的是文本元素，但点击的不是Text标签，则清除选中
            if (selectedElementType === "text" && tab !== "Text") {
                onClearSelection();
            }
            // 如果选中的是图片或视频元素，但点击的不是Media标签，则清除选中
            else if ((selectedElementType === "image" || selectedElementType === "video") && tab !== "Media") {
                onClearSelection();
            }
            // 如果选中的是头像元素，但点击的不是Avatar标签，则清除选中
            else if (selectedElementType === "avatar" && tab !== "Avatar") {
                onClearSelection();
            }
        }
        
        setActiveTab(tab)
        
        // 如果点击的是 Text 标签，打开弹出框
        if (tab === "Text" && onSelectTextType) {
            setIsTextPopoverOpen(true)
        }
    }

    return (
        <div className="flex border-b overflow-x-auto VideoTabs">
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