"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import ScriptContent from "@/components/script/script-content";
import { BackgroundContent } from "@/components/background/background-content";
import { VideoHeader } from "@/components/workspace/workspace-header";
import { VideoTimeline } from "@/components/workspace/workspace-timeline";
import { VideoTabs } from "@/components/workspace/workspace-tabs";
import placeholderImage from "@/assets/avatar.png"
import AvatarContent from "@/components/avatar/avatar-content";
import TextContent from "@/components/text/text-content";
import { ResizableText } from "@/components/workspace/resizable-text"
import { ResizableImage } from "@/components/workspace/resizable-image"
import { ResizableAvatar } from "@/components/workspace/resizable-avatar"

// 导入类型定义
import { 
    Scene, 
    TextElement, 
    ImageElement, 
    AvatarElement, 
    Background,
    SelectedElementType,
    ColorBackground,
    ImageBackground,
    VideoBackground
} from "@/types/scene"

// 导出类型以便其他组件使用
export type { 
    Scene, 
    TextElement, 
    ImageElement, 
    AvatarElement, 
    Background,
    ColorBackground,
    ImageBackground,
    VideoBackground,
    SelectedElementType
} from "@/types/scene"

export default function VideoEditor() {
    const [activeTab, setActiveTab] = useState<string>("Script")
    const [activeScene, setActiveScene] = useState<number>(0)
    const [scenes, setScenes] = useState<Scene[]>([
        {
            title: "Title",
            image: { src: placeholderImage, width: 200, height: 300, x: 0, y: 0, rotation: 0 },
            texts: [{  // 修改为数组
                content: "Title",
                fontSize: 56,
                x: 0,
                y: 0,
                width: 300,
                height: 100,
                rotation: 0,
                fontFamily: "lora",
                fontColor: "#000000",
                backgroundColor: "rgba(255, 255, 255, 0)",
                bold: false,
                italic: false,
                alignment: "center"
            }],
            avatar: null,
            background : {
                type: "color",
                color: "#FFFFFF"
            }
        },
        {
            title: "Introduction",
            image: { src: placeholderImage, width: 200, height: 300, x: 0, y: 0, rotation: 0 },
            texts: [{  // 修改为数组
                content: "Introduction",
                fontSize: 48,
                x: 0,
                y: 0,
                width: 300,
                height: 100,
                rotation: 0,
                fontFamily: "lora",
                fontColor: "#000000",
                backgroundColor: "rgba(255, 255, 255, 0)",
                bold: false,
                italic: false,
                alignment: "center"
            }],
            avatar: null,
            background : {
                type: "color",
                color: "#FFFFFF"
            }
        },
    ])

    const tabs: string[] = [
        "Script",
        "Avatar",
        "Background",
        "Media",
        "Text",
    ]
    const [history, setHistory] = useState<Scene[][]>([scenes])
    const [historyIndex, setHistoryIndex] = useState<number>(0)
    const [selectedElement, setSelectedElement] = useState<SelectedElementType | null>(null)

    const handleElementSelect = useCallback((element: SelectedElementType | null) => {
        setSelectedElement(element)

        // Update activeTab based on selected element
        if (element?.type === "text") {
            setActiveTab("Text")
        } else if (element?.type === "avatar") {
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
            if (!selectedElement || selectedElement.type !== "text" || selectedElement.index === undefined) return;

            const newScenes = [...scenes]
            if (newScenes[activeScene].texts[selectedElement.index]) {
                newScenes[activeScene].texts[selectedElement.index].content = newText
            }
            updateHistory(newScenes)
        },
        [scenes, activeScene, selectedElement, updateHistory],
    )

    const handleTextUpdate = useCallback(
        (newProps: Partial<TextElement>) => {
            if (!selectedElement || selectedElement.type !== "text" || selectedElement.index === undefined) return;

            const newScenes = [...scenes]
            if (newScenes[activeScene].texts[selectedElement.index]) {
                newScenes[activeScene].texts[selectedElement.index] = {
                    ...newScenes[activeScene].texts[selectedElement.index],
                    ...newProps
                } as TextElement
            }
            updateHistory(newScenes)
        },
        [scenes, activeScene, selectedElement, updateHistory],
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

        if (selectedElement.type === "text" && selectedElement.index !== undefined) {
            // 删除指定索引的文本元素
            newScenes[activeScene].texts.splice(selectedElement.index, 1);
        } else if (selectedElement.type === "image") {
            // 将选中的元素设置为 null
            newScenes[activeScene].image = null;
        } else if (selectedElement.type === "avatar") {
            // 将选中的元素设置为 null
            newScenes[activeScene].avatar = null;
        }

        // 更新历史记录
        updateHistory(newScenes);

        // 清除选中状态
        setSelectedElement(null);
    }, [scenes, activeScene, selectedElement, updateHistory]);

    // 添加处理文本类型选择的函数
    const handleSelectTextType = useCallback(
        (type: "title" | "subtitle" | "body") => {
            const newScenes = [...scenes]
            // 创建新的文本元素
            const newText: TextElement = {
                content: type === "title" ? "标题" : type === "subtitle" ? "副标题" : "正文",
                fontSize: type === "title" ? 216 : type === "subtitle" ? 130 : 65,
                x: 1920 / 2 - 400, // 水平居中，考虑宽度
                y: 1080 / 2 - 100, // 垂直居中，考虑高度
                // 调整宽高以更好地包围文本
                width: 800, // 增加宽度以适应文本
                height: 200, // 增加高度以适应文本
                rotation: 0,
                fontFamily: "lora",
                fontColor: "#000000",
                backgroundColor: "rgba(255, 255, 255, 0)",
                bold: type === "title",
                italic: false,
                alignment: "center"
            }

            // 在当前场景中添加新的文本元素
            if (!newScenes[activeScene].texts) {
                newScenes[activeScene].texts = [];
            }
            newScenes[activeScene].texts.push(newText);
            updateHistory(newScenes);

            // 选中新添加的文本元素
            setSelectedElement({
                type: "text",
                index: newScenes[activeScene].texts.length - 1
            });
            setActiveTab("Text");
        },
        [scenes, activeScene, updateHistory]
    )

    // 添加处理背景变化的函数
    const handleBackgroundChange = useCallback((background: Background) => {
        const newScenes = [...scenes];
        newScenes[activeScene].background = background;
        updateHistory(newScenes);
    }, [scenes, activeScene, updateHistory]);

    // 修改渲染Tab内容的函数
    const renderTabContent = () => {
        switch (activeTab) {
            case "Script":
                return <ScriptContent />
            case "Avatar":
                return <AvatarContent />
            case "Background":
                return <BackgroundContent 
                    currentBackground={scenes[activeScene].background}
                    onBackgroundChange={handleBackgroundChange} 
                />
            case "Text":
                return <TextContent
                    textElement={selectedElement?.type === "text" && selectedElement.index !== undefined
                        ? scenes[activeScene].texts[selectedElement.index]
                        : undefined}
                    onUpdate={handleTextUpdate}
                />
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
            texts: [],  // 初始化为空数组
            avatar: null,
            background : {
                type: "color",
                color: "#FFFFFF"
            }
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
            // setSelectedElement("avatar")
            setActiveTab("Avatar")
        },
        [scenes, activeScene, updateHistory]
    )
    // 添加预览容器尺寸状态
    const [previewDimensions, setPreviewDimensions] = useState({
        width: 0,
        height: 0
    });

    // 添加 editorRef
    const editorRef = useRef<HTMLDivElement>(null);

    // 使用 ResizeObserver 监听预览容器尺寸变化
    useEffect(() => {
        if (!editorRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setPreviewDimensions({
                    width,
                    height
                });
            }
        });

        resizeObserver.observe(editorRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

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
                onSelectTextType={handleSelectTextType} // 添加文本类型选择处理函数
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
                        {/* 直接集成 VideoPreview 的内容 */}
                        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                            <div
                                ref={editorRef}
                                className="w-full max-w-3xl aspect-video shadow-md relative"
                                style={{ 
                                    backgroundColor: scenes[activeScene].background.type === "color" 
                                        ? (scenes[activeScene].background as ColorBackground).color 
                                        : "transparent",
                                    backgroundImage: scenes[activeScene].background.type === "image" 
                                        ? `url(${(scenes[activeScene].background as ImageBackground).src})` 
                                        : "none",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                }}
                                data-width="1920"
                                data-height="1080"
                                onClick={(e: React.MouseEvent) => {
                                    if (e.target === e.currentTarget) {
                                        setSelectedElement(null)
                                    }
                                }}
                            >
                                {/* 如果背景是视频类型，添加视频元素 */}
                                {scenes[activeScene].background.type === "video" && (
                                    <video
                                        className="absolute inset-0 w-full h-full object-cover"
                                        src={(scenes[activeScene].background as VideoBackground).src}
                                        autoPlay
                                        loop={(scenes[activeScene].background as VideoBackground).displayMode === "loop"}
                                        muted={(scenes[activeScene].background as VideoBackground).volume === 0}
                                        onEnded={(e) => {
                                            const videoBackground = scenes[activeScene].background as VideoBackground;
                                            if (videoBackground.displayMode === "freeze") {
                                                // 暂停在最后一帧
                                                e.currentTarget.currentTime = e.currentTarget.duration;
                                                e.currentTarget.pause();
                                            } else if (videoBackground.displayMode === "hide") {
                                                // 隐藏视频
                                                e.currentTarget.style.display = "none";
                                            }
                                            // loop模式会自动循环播放
                                        }}
                                        ref={(el) => {
                                            if (el) {
                                                // 设置音量
                                                el.volume = (scenes[activeScene].background as VideoBackground).volume || 0;
                                                
                                                // 使用自定义属性存储上次的显示模式，避免重复播放
                                                const videoBackground = scenes[activeScene].background as VideoBackground;
                                                const lastDisplayMode = el.getAttribute('data-display-mode');
                                                const currentDisplayMode = videoBackground.displayMode || 'loop';
                                                
                                                // 只有在显示模式变化或首次加载时才重置视频状态
                                                if (lastDisplayMode !== currentDisplayMode || !el.getAttribute('data-initialized')) {
                                                    // 重置显示状态
                                                    el.style.display = "block";
                                                    
                                                    if (videoBackground.displayMode === "freeze") {
                                                        // 对于freeze模式，总是从头开始播放一次
                                                        el.currentTime = 0;
                                                        el.play();
                                                    } else if (videoBackground.displayMode === "loop") {
                                                        el.currentTime = 0;
                                                        el.play();
                                                    } else if (videoBackground.displayMode === "hide") {
                                                        el.currentTime = 0;
                                                        el.play();
                                                    }
                                                    
                                                    // 标记为已初始化
                                                    el.setAttribute('data-initialized', 'true');
                                                    // 存储当前显示模式
                                                    el.setAttribute('data-display-mode', currentDisplayMode);
                                                }
                                            }
                                        }}
                                    />
                                )}
                                {scenes[activeScene].texts.map((text, index) => (
                                    <ResizableText
                                        key={index}
                                        {...text}
                                        canvasWidth={1920}
                                        canvasHeight={1080}
                                        containerWidth={previewDimensions.width}
                                        containerHeight={previewDimensions.height}
                                        onTextChange={handleTextChange}
                                        onResize={handleTextUpdate}
                                        onSelect={() => handleElementSelect({ type: "text", index })}
                                        isSelected={selectedElement?.type === "text" && selectedElement.index === index}
                                    />
                                ))}
                                {scenes[activeScene].image && (
                                    <ResizableImage
                                        {...scenes[activeScene].image}
                                        onResize={handleImageResize}
                                        onSelect={() => handleElementSelect({ type: "image" })}
                                        isSelected={selectedElement?.type === "image"}
                                    />
                                )}

                                {scenes[activeScene].avatar && (
                                    <ResizableAvatar
                                        {...scenes[activeScene].avatar}
                                        onResize={handleAvatarResize}
                                        onSelect={() => handleElementSelect({ type: "avatar" })}
                                        isSelected={selectedElement?.type === "avatar"}
                                    />
                                )}
                            </div>
                        </div>

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

