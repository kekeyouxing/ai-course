"use client"

import {
    FileText,
    Image,
    Layers,
    Type,
    User,
    Square
} from "lucide-react"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ShapeType } from "@/types/scene"

interface VideoTabsProps {
    tabs: string[]
    activeTab: string
    setActiveTab: (tab: string) => void
    onSelectTextType?: (type: "title" | "subtitle" | "body") => void
    // 添加选中元素的类型和清除选中的回调
    selectedElementType?: string | null
    onClearSelection?: () => void
    // 添加选中形状类型的回调
    onSelectShapeType?: (type: ShapeType) => void
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

// 封装形状类型选择组件
function ShapeTypeSelector({
    onOpenChange,
    onSelectType 
}: {
    isOpen: boolean; 
    onOpenChange: (open: boolean) => void; 
    onSelectType: (type: ShapeType) => void 
}) {
    const shapeTypes: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
        // 基础实心形状
        { 
            type: "rectangle", 
            label: "矩形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <rect x="4" y="4" width="32" height="32" />
                </svg>
            )
        },
        { 
            type: "circle", 
            label: "圆形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <circle cx="20" cy="20" r="16" />
                </svg>
            )
        },
        { 
            type: "triangle", 
            label: "三角形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <polygon points="20,5 35,35 5,35" />
                </svg>
            )
        },
        { 
            type: "diamond", 
            label: "菱形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <polygon points="20,5 35,20 20,35 5,20" />
                </svg>
            )
        },
        { 
            type: "star", 
            label: "星形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M20,5 L24.5,14.8 L35,16.4 L27.5,24.2 L29.1,35 L20,30 L10.9,35 L12.5,24.2 L5,16.4 L15.5,14.8 L20,5 Z" />
                </svg>
            )
        },
        
        // 基础空心形状
        { 
            type: "hollowRectangle", 
            label: "空心矩形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3">
                    <rect x="4" y="4" width="32" height="32" />
                </svg>
            )
        },
        { 
            type: "hollowCircle", 
            label: "空心圆形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="20" cy="20" r="16" />
                </svg>
            )
        },
        { 
            type: "hollowTriangle", 
            label: "空心三角形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3">
                    <polygon points="20,5 35,35 5,35" />
                </svg>
            )
        },
        { 
            type: "hollowStar", 
            label: "空心星形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20,5 L24.5,14.8 L35,16.4 L27.5,24.2 L29.1,35 L20,30 L10.9,35 L12.5,24.2 L5,16.4 L15.5,14.8 L20,5 Z" />
                </svg>
            )
        },
        { 
            type: "quarterCircle", 
            label: "四分之一圆",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M5,35 L5,5 L35,5 A30,30 0 0 1 5,35 Z" />
                </svg>
            )
        },
        { 
            type: "halfCircle", 
            label: "半圆",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M5,20 A15,15 0 0 1 35,20 L5,20 Z" />
                </svg>
            )
        },
        { 
            type: "cross", 
            label: "十字形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M15,5 H25 V15 H35 V25 H25 V35 H15 V25 H5 V15 H15 Z" />
                </svg>
            )
        },
        
        // 多边形和箭头
        { 
            type: "pentagon", 
            label: "五边形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <polygon points="20,5 35,15 30,33 10,33 5,15" />
                </svg>
            )
        },
        { 
            type: "hexagon", 
            label: "六边形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <polygon points="10,5 30,5 35,20 30,35 10,35 5,20" />
                </svg>
            )
        },
        { 
            type: "trapezoid", 
            label: "梯形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <polygon points="10,10 30,10 35,30 5,30" />
                </svg>
            )
        },
        { 
            type: "parallelogram", 
            label: "平行四边形",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <polygon points="10,10 35,10 30,30 5,30" />
                </svg>
            )
        },
        { 
            type: "arrow", 
            label: "箭头",
            icon: (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                    <polygon points="5,15 20,15 20,5 35,20 20,35 20,25 5,25" />
                </svg>
            )
        }
    ];

    return (
        <PopoverContent className="w-80 p-3" align="start">
            <div className="grid grid-cols-4 gap-2">
                {shapeTypes.map(({ type, label, icon }) => (
                    <button
                        key={type}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded flex items-center justify-center transition-colors"
                        onClick={() => {
                            onSelectType(type)
                            onOpenChange(false)
                        }}
                        title={label}
                    >
                        <div className="text-black w-10 h-10 flex items-center justify-center">
                            {icon}
                        </div>
                    </button>
                ))}
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
    onClearSelection,
    onSelectShapeType
}: VideoTabsProps) {
    const [isTextPopoverOpen, setIsTextPopoverOpen] = useState(false)
    const [isShapePopoverOpen, setIsShapePopoverOpen] = useState(false)

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
            // 如果选中的是形状元素，但点击的不是Shape标签，则清除选中
            else if (selectedElementType === "shape" && tab !== "Shape") {
                onClearSelection();
            }
        }
        
        setActiveTab(tab)
        
        // 如果点击的是 Text 标签，打开弹出框
        if (tab === "Text" && onSelectTextType) {
            setIsTextPopoverOpen(true)
        }
        
        // 如果点击的是 Shape 标签，打开形状弹出框
        if (tab === "Shape" && onSelectShapeType) {
            setIsShapePopoverOpen(true)
        }
    }

    return (
        <div className="flex border-b overflow-x-auto VideoTabs">
            {tabs.map((tab) => {
                if (tab === "Text" && onSelectTextType) {
                    return (
                        <Popover key={tab} open={isTextPopoverOpen && activeTab === "Text"} onOpenChange={setIsTextPopoverOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    className={`flex flex-col items-center px-4 py-2 text-xs ${activeTab === tab ? "border-b-2 border-black" : "text-gray-500"}`}
                                    onClick={() => handleTabClick(tab)}
                                >
                                    <Type className="h-5 w-5 mb-1" />
                                    文本
                                </button>
                            </PopoverTrigger>
                            <TextTypeSelector 
                                isOpen={isTextPopoverOpen} 
                                onOpenChange={setIsTextPopoverOpen} 
                                onSelectType={onSelectTextType} 
                            />
                        </Popover>
                    );
                } else if (tab === "Shape" && onSelectShapeType) {
                    return (
                        <Popover key={tab} open={isShapePopoverOpen && activeTab === "Shape"} onOpenChange={setIsShapePopoverOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    className={`flex flex-col items-center px-4 py-2 text-xs ${activeTab === tab ? "border-b-2 border-black" : "text-gray-500"}`}
                                    onClick={() => handleTabClick(tab)}
                                >
                                    <Square className="h-5 w-5 mb-1" />
                                    图形
                                </button>
                            </PopoverTrigger>
                            <ShapeTypeSelector 
                                isOpen={isShapePopoverOpen} 
                                onOpenChange={setIsShapePopoverOpen} 
                                onSelectType={onSelectShapeType} 
                            />
                        </Popover>
                    );
                } else {
                    return (
                        <button
                            key={tab}
                            className={`flex flex-col items-center px-4 py-2 text-xs ${activeTab === tab ? "border-b-2 border-black" : "text-gray-500"}`}
                            onClick={() => handleTabClick(tab)}
                        >
                            {tab === "Script" && <FileText className="h-5 w-5 mb-1" />}
                            {tab === "Avatar" && <User className="h-5 w-5 mb-1" />}
                            {tab === "Background" && <Layers className="h-5 w-5 mb-1" />}
                            {tab === "Media" && <Image className="h-5 w-5 mb-1" />}
                            {tab === "Script" && "脚本"}
                            {tab === "Avatar" && "角色"}
                            {tab === "Background" && "背景"}
                            {tab === "Media" && "媒体"}
                        </button>
                    );
                }
            })}
        </div>
    )
}