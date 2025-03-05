"use client"
import {useCallback, useEffect, useRef, useState} from "react"
import {
    Check,
    ContrastIcon as Transition,
    Edit,
    Eye,
    FileText,
    Image,
    Layers,
    MessageSquare,
    Music,
    Plus,
    Redo,
    Type,
    Undo,
    User,
    Wand2,
    Zap,
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable"
import {ResizableText} from "@/components/resizable-text"
import {ResizableImage} from "@/components/resizable-image"
import {ScriptContent} from "@/components/script-content.tsx";
import {AvatarContent} from "@/components/avatar-content.tsx";
import {BackgroundContent} from "@/components/background-content.tsx";

interface TextElement {
    content: string
    fontSize: number
    x: number
    y: number
    width: number
    height: number
    rotation: number
}

interface ImageElement {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
}

interface Scene {
    title: string
    image: ImageElement | null
    text: TextElement
}

export default function VideoEditor() {
    const [activeTab, setActiveTab] = useState<string>("Script")
    const [activeScene, setActiveScene] = useState<number>(0)
    const [scenes, setScenes] = useState<Scene[]>([
        {
            title: "Title",
            image: {src: "/placeholder.svg?height=300&width=200", width: 200, height: 300, x: 0, y: 0, rotation: 0},
            text: {content: "Title", fontSize: 56, x: 0, y: 0, width: 300, height: 100, rotation: 0},
        },
        {
            title: "Introduction",
            image: {src: "/placeholder.svg?height=300&width=200", width: 200, height: 300, x: 0, y: 0, rotation: 0},
            text: {content: "Introduction", fontSize: 48, x: 0, y: 0, width: 300, height: 100, rotation: 0},
        },
    ])

    const tabs: string[] = [
        "Script",
        "Avatar",
        "Background",
        "Media",
        "Text",
        "Music",
        "Transition",
        "Interaction",
        "Comments",
    ]
    const [history, setHistory] = useState<Scene[][]>([scenes])
    const [historyIndex, setHistoryIndex] = useState<number>(0)
    const [selectedElement, setSelectedElement] = useState<"text" | "image" | null>(null)
    const editorRef = useRef<HTMLDivElement>(null)

    const updateHistory = useCallback(
        (newScenes: Scene[]) => {
            setHistory((prevHistory) => {
                const newHistory = prevHistory.slice(0, historyIndex + 1)
                newHistory.push(newScenes)
                return newHistory
            })
            setHistoryIndex((prevIndex) => prevIndex + 1)
            setScenes(newScenes)
        },
        [historyIndex],
    )

    const handleSceneClick = useCallback((index: number) => {
        setActiveScene(index)
        setSelectedElement(null)
    }, [])

    const handleTextChange = useCallback(
        (newText: string) => {
            const newScenes = [...scenes]
            newScenes[activeScene].text.content = newText
            updateHistory(newScenes)
        },
        [scenes, activeScene, updateHistory],
    )

    const handleTextResize = useCallback(
        (newSize: Partial<TextElement>) => {
            const newScenes = [...scenes]
            newScenes[activeScene].text = {...newScenes[activeScene].text, ...newSize}
            updateHistory(newScenes)
        },
        [scenes, activeScene, updateHistory],
    )

    const handleImageResize = useCallback(
        (newSize: Partial<ImageElement>) => {
            const newScenes = [...scenes]
            if (newScenes[activeScene].image) {
                newScenes[activeScene].image = {...newScenes[activeScene].image, ...newSize} as ImageElement
                updateHistory(newScenes)
            }
        },
        [scenes, activeScene, updateHistory],
    )

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex((prevIndex) => prevIndex - 1)
            setScenes(history[historyIndex - 1])
        }
    }, [history, historyIndex])

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex((prevIndex) => prevIndex + 1)
            setScenes(history[historyIndex + 1])
        }
    }, [history, historyIndex])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === "z") {
                    e.preventDefault()
                    handleUndo()
                } else if (e.key === "y") {
                    e.preventDefault()
                    handleRedo()
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleUndo, handleRedo])

    const renderTabContent = () => {
        switch (activeTab) {
            case "Script":
                return <ScriptContent/>
            case "Avatar":
                return <AvatarContent/>
            case "Background":
                return <BackgroundContent/>
            // Add more cases for other tabs
            default:
                return <div>Content for {activeTab}</div>
        }
    }
    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Top Navigation */}
            <header className="flex items-center justify-between px-4 py-2 border-b">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full border-2 border-white"></div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUndo}
                                disabled={historyIndex === 0}>
                            <Undo className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRedo}
                            disabled={historyIndex === history.length - 1}
                        >
                            <Redo className="h-4 w-4"/>
                        </Button>
                        <div className="h-4 border-r border-gray-300 mx-1"></div>
                        <Button
                            variant="outline"
                            className="h-8 px-3 text-sm bg-blue-50 text-blue-500 border-blue-100 flex items-center gap-1"
                        >
                            Upgrade
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <Zap className="h-3 w-3 text-white"/>
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center">
                    <h1 className="text-sm font-medium mr-4">Create your first AI video</h1>
                    <Button variant="ghost" size="icon" className="h-8 w-8 mr-2">
                        <Edit className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" className="h-8 px-3 text-sm flex items-center gap-1 mr-2">
                        <Eye className="h-4 w-4"/>
                        Preview
                    </Button>
                    <Button className="h-8 px-3 text-sm bg-black text-white flex items-center gap-1">
                        Generate
                        <Check className="h-4 w-4"/>
                    </Button>
                </div>
            </header>
            <div className="flex border-b overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`flex flex-col items-center px-4 py-2 text-xs ${
                            activeTab === tab ? "border-b-2 border-black" : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === "Script" && <FileText className="h-5 w-5 mb-1"/>}
                        {tab === "Avatar" && <User className="h-5 w-5 mb-1"/>}
                        {tab === "Background" && <Layers className="h-5 w-5 mb-1"/>}
                        {tab === "Media" && <Image className="h-5 w-5 mb-1"/>}
                        {tab === "Text" && <Type className="h-5 w-5 mb-1"/>}
                        {tab === "Music" && <Music className="h-5 w-5 mb-1"/>}
                        {tab === "Transition" && <Transition className="h-5 w-5 mb-1"/>}
                        {tab === "Interaction" && <Wand2 className="h-5 w-5 mb-1"/>}
                        {tab === "Comments" && <MessageSquare className="h-5 w-5 mb-1"/>}
                        {tab}
                    </button>
                ))}
            </div>
            {/* Main Content */}
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Left Sidebar - Tools */}
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                    <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
                </ResizablePanel>
                {/* Main Editor Area */}
                <ResizablePanel defaultSize={70}>
                    <div className="h-full flex flex-col bg-gray-100">
                        {/* Video Preview */}
                        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                            <div
                                ref={editorRef}
                                className="bg-white w-full max-w-3xl aspect-video shadow-md relative"
                                onClick={(e: React.MouseEvent) => {
                                    if (e.target === e.currentTarget) {
                                        setSelectedElement(null)
                                    }
                                }
                                }
                            >

                                {scenes[activeScene].text && (
                                    <ResizableText
                                        {...scenes[activeScene].text}
                                        onTextChange={handleTextChange}
                                        onResize={handleTextResize}
                                        onSelect={() => setSelectedElement("text")}
                                        isSelected={selectedElement === "text"}
                                    />
                                )}

                                {scenes[activeScene].image && (
                                    <ResizableImage
                                        {...scenes[activeScene].image}
                                        onResize={handleImageResize}
                                        onSelect={() => setSelectedElement("image")}
                                        isSelected={selectedElement === "image"}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="h-[200px] border-t bg-white py-8">
                            <div className="flex items-center mb-4">
                                <div className="flex-1 ml-4 flex space-x-2 overflow-x-auto">
                                    {scenes.map((scene, index) => (
                                        <div
                                            key={index}
                                            className={`border rounded-md overflow-hidden w-[150px] cursor-pointer ${
                                                activeScene === index ? "ring-2 ring-blue-500" : ""
                                            }`}
                                            onClick={() => handleSceneClick(index)}
                                        >
                                            <div className="relative">
                                                <img
                                                    src="/placeholder.svg?height=80&width=150"
                                                    alt={`Scene ${index + 1} thumbnail`}
                                                    className="w-full h-[80px] object-cover"
                                                />
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                                                    {scene.title}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div
                                        className="border rounded-md overflow-hidden w-[80px] flex items-center justify-center cursor-pointer"
                                        onClick={() => {
                                            const newScene: Scene = {
                                                title: `Scene ${scenes.length + 1}`,
                                                image: null,
                                                text: {
                                                    content: `Scene ${scenes.length + 1}`,
                                                    fontSize: 48,
                                                    x: 0,
                                                    y: 0,
                                                    width: 300,
                                                    height: 100,
                                                    rotation: 0,
                                                },
                                            }
                                            updateHistory([...scenes, newScene])
                                            setActiveScene(scenes.length)
                                        }}
                                    >
                                        <Plus className="h-6 w-6 text-gray-400"/>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500">Estimated video length: 01:11</div>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

