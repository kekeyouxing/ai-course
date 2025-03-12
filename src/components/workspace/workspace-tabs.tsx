"use client"

import {
    ContrastIcon as Transition,
    FileText,
    Image,
    Layers,
    MessageSquare,
    Music,
    Type,
    User,
    Wand2,
} from "lucide-react"

interface Profile {
    id: string
    name: string
    image: string
}

interface VideoTabsProps {
    tabs: string[]
    activeTab: string
    setActiveTab: (tab: string) => void
    onSelectAvatar?: (profile: Profile) => void
}

export function VideoTabs({ tabs, activeTab, setActiveTab }: VideoTabsProps) {

    const handleTabClick = (tab: string) => {
        setActiveTab(tab)
    }


    return (
        <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={`flex flex-col items-center px-4 py-2 text-xs ${activeTab === tab ? "border-b-2 border-black" : "text-gray-500"}`}
                    onClick={() => handleTabClick(tab)}
                >
                    {tab === "Script" && <FileText className="h-5 w-5 mb-1" />}
                    {tab === "Avatar" && <User className="h-5 w-5 mb-1" />}
                    {tab === "Background" && <Layers className="h-5 w-5 mb-1" />}
                    {tab === "Media" && <Image className="h-5 w-5 mb-1" />}
                    {tab === "Text" && <Type className="h-5 w-5 mb-1" />}
                    {tab === "Music" && <Music className="h-5 w-5 mb-1" />}
                    {tab === "Transition" && <Transition className="h-5 w-5 mb-1" />}
                    {tab === "Interaction" && <Wand2 className="h-5 w-5 mb-1" />}
                    {tab === "Comments" && <MessageSquare className="h-5 w-5 mb-1" />}
                    {tab}
                </button>

            ))}
        </div>
    )
}