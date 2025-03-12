"use client"
import { useCallback, useEffect, useState } from "react"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import ScriptContent from "@/components/script/script-content";
import { BackgroundContent } from "@/components/background/background-content";
import { VideoHeader } from "@/components/workspace/workspace-header";
import { VideoPreview } from "@/components/workspace/workspace-preview";
import { VideoTimeline } from "@/components/workspace/workspace-timeline";
import { VideoTabs } from "@/components/workspace/workspace-tabs";
import placeholderImage from "@/assets/avatar.png"
import AvatarContent from "@/components/avatar/avatar-content";
import TextContent from "@/components/text/text-content";

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

interface AvatarElement {
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
    text: TextElement | null
    avatar: AvatarElement | null
}

export default function VideoEditor() {
    const [activeTab, setActiveTab] = useState<string>("Script")
    const [activeScene, setActiveScene] = useState<number>(0)
    const [scenes, setScenes] = useState<Scene[]>([
        {
            title: "Title",
            image: { src: placeholderImage, width: 200, height: 300, x: 0, y: 0, rotation: 0 },
            text: { content: "Title", fontSize: 56, x: 0, y: 0, width: 300, height: 100, rotation: 0 },
            avatar: null
        },
        {
            title: "Introduction",
            image: { src: placeholderImage, width: 200, height: 300, x: 0, y: 0, rotation: 0 },
            text: { content: "Introduction", fontSize: 48, x: 0, y: 0, width: 300, height: 100, rotation: 0 },
            avatar: null
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
    const [selectedElement, setSelectedElement] = useState<"text" | "image" | "avatar" | null>(null)
    
    // Function to handle element selection and update activeTab accordingly
    const handleElementSelect = useCallback((element: "text" | "image" | "avatar" | null) => {
        setSelectedElement(element)
        
        // Update activeTab based on selected element
        if (element === "text") {
            setActiveTab("Text")
        } else if (element === "avatar") {
            setActiveTab("Avatar")
        }
    }, [])

    // 改进的历史记录更新函数
    const updateHistory = useCallback(
        (newScenes: Scene[]) => {
            // 如果当前不在历史记录的最后，则截断历史记录
            const newHistory = history.slice(0, historyIndex + 1)
            // 添加新的状态到历史记录
            newHistory.push(JSON.parse(JSON.stringify(newScenes))) // 深拷贝确保状态独立
            setHistory(newHistory)
            setHistoryIndex(newHistory.length - 1)
            setScenes(JSON.parse(JSON.stringify(newScenes))) // 确保状态更新
        },
        [history, historyIndex],
    )

    const handleSceneClick = useCallback((index: number) => {
        setActiveScene(index)
        setSelectedElement(null)
    }, [])

    const handleTextChange = useCallback(
        (newText: string) => {
            const newScenes = [...scenes]
            if (newScenes[activeScene].text) {
                newScenes[activeScene].text.content = newText
            }
            updateHistory(newScenes)
        },
        [scenes, activeScene, updateHistory],
    )

    const handleTextResize = useCallback(
        (newSize: Partial<TextElement>) => {
            const newScenes = [...scenes]
            if (newScenes[activeScene].text) {
                newScenes[activeScene].text = { ...newScenes[activeScene].text, ...newSize } as TextElement
            }
            updateHistory(newScenes)
        },
        [scenes, activeScene, updateHistory],
    )

    const handleImageResize = useCallback(
        (newSize: Partial<ImageElement>) => {
            const newScenes = [...scenes]
            if (newScenes[activeScene].image) {
                newScenes[activeScene].image = { ...newScenes[activeScene].image, ...newSize } as ImageElement
                updateHistory(newScenes)
            }
        },
        [scenes, activeScene, updateHistory],
    )

    const handleAvatarResize = useCallback(
        (newSize: Partial<AvatarElement>) => {
            const newScenes = [...scenes]
            if (newScenes[activeScene].avatar) {
                newScenes[activeScene].avatar = { ...newScenes[activeScene].avatar, ...newSize } as AvatarElement
                updateHistory(newScenes)
            }
        },
        [scenes, activeScene, updateHistory],
    )

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1
            setHistoryIndex(newIndex)
            // 使用深拷贝确保状态独立
            setScenes(JSON.parse(JSON.stringify(history[newIndex])))
        }
    }, [history, historyIndex])

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1
            setHistoryIndex(newIndex)
            // 使用深拷贝确保状态独立
            setScenes(JSON.parse(JSON.stringify(history[newIndex])))
        }
    }, [history, historyIndex])

    // 在 useEffect 中添加删除元素的键盘事件监听
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 检查是否在输入框中
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
                e.preventDefault();
                handleRedo();
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
                // 当按下删除键且有选中的元素时，删除该元素
                e.preventDefault();
                handleDeleteElement();
            }
        }
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, selectedElement]);

    // 添加删除元素的处理函数
    const handleDeleteElement = useCallback(() => {
        if (!selectedElement) return;
        
        const newScenes = [...scenes];
        // 将选中的元素设置为 null
        newScenes[activeScene][selectedElement] = null;
        
        // 更新历史记录
        updateHistory(newScenes);
        
        // 清除选中状态
        setSelectedElement(null);
    }, [scenes, activeScene, selectedElement, updateHistory]);

    const renderTabContent = () => {
        switch (activeTab) {
            case "Script":
                return <ScriptContent />
            case "Avatar":
                return <AvatarContent />
            case "Background":
                return <BackgroundContent />
            case "Text":
                return <TextContent/>
            // Add more cases for other tabs
            default:
                return <div>Content for {activeTab}</div>
        }
    }
    
    const [videoTitle, setVideoTitle] = useState<string>("编辑您的项目名称")
    
    const addNewScene = useCallback(() => {
        const newScene: Scene = {
            title: `Scene ${scenes.length + 1}`,
            image: null,
            text: null,
            avatar: null
        }
        updateHistory([...scenes, newScene])
        setActiveScene(scenes.length)
    }, [scenes, updateHistory])
            // 在 VideoEditor 组件中添加处理头像选择的函数
            const handleSelectAvatar = useCallback(
                (profile: { id: string; name: string; image: string }) => {
                    const newScenes = [...scenes]
                    // 创建新的头像元素
                    const newAvatar: AvatarElement = {
                        src: profile.image,
                        width: 150,
                        height: 150,
                        x: 50,
                        y: 50,
                        rotation: 0
                    }
                    
                    // 更新当前场景的头像
                    newScenes[activeScene].avatar = newAvatar
                    updateHistory(newScenes)
                    
                    // 选中头像元素
                    setSelectedElement("avatar")
                    setActiveTab("Avatar")
                },
                [scenes, activeScene, updateHistory]
            )
    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Top Navigation */}
            <VideoHeader
                videoTitle={videoTitle}
                setVideoTitle={setVideoTitle}
                handleUndo={handleUndo}
                handleRedo={handleRedo}
                historyIndex={historyIndex}
                historyLength={history.length}
            />
        
            <VideoTabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSelectAvatar={handleSelectAvatar}
            />
            
            {/* Main Content */}
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Left Sidebar - Tools */}
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                    <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
                </ResizablePanel>
                {/* 添加调整手柄 */}
                <ResizableHandle />
                {/* Main Editor Area */}
                <ResizablePanel defaultSize={75}>
                    <div className="h-full flex flex-col bg-gray-100">
                        {/* Video Preview */}
                        <VideoPreview 
                            scenes={scenes}
                            activeScene={activeScene}
                            selectedElement={selectedElement}
                            handleTextChange={handleTextChange}
                            handleTextResize={handleTextResize}
                            handleImageResize={handleImageResize}
                            handleAvatarResize={handleAvatarResize}
                            setSelectedElement={handleElementSelect}
                        />

                        {/* Timeline */}
                        <VideoTimeline 
                            scenes={scenes}
                            activeScene={activeScene}
                            handleSceneClick={handleSceneClick}
                            addNewScene={addNewScene}
                        />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

