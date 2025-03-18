"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import ScriptContent from "@/components/script/script-content";
import { BackgroundContent } from "@/components/background/background-content";
import { BackgroundRenderer } from "@/components/background/background-renderer";
import { VideoHeader } from "@/components/workspace/workspace-header";
import { VideoTimeline } from "@/components/workspace/workspace-timeline";
import { VideoTabs } from "@/components/workspace/workspace-tabs";
import placeholderImage from "@/assets/avatar.png"
import AvatarContent from "@/components/avatar/avatar-content";
import TextContent from "@/components/text/text-content";
import { ResizableText } from "@/components/workspace/resizable-text"
import { ResizableImage } from "@/components/workspace/resizable-image"
import { ResizableAvatar } from "@/components/workspace/resizable-avatar"
import { ElementContextMenu } from "@/components/workspace/element-context-menu"
import { bringToFront, sendToBack, bringForward, sendBackward } from "@/utils/layer-controls";
import { getAllElementsForAlignment } from "@/utils/alignment-utils";

// 导入类型定义
import {
    Scene,
    TextElement,
    ImageElement,
    VideoElement,
    ImageMedia,
    VideoMedia,
    AvatarElement,
    Background,
    SelectedElementType,
} from "@/types/scene"
import { v4 as uuidv4 } from 'uuid';
import { ResizableVideo } from "@/components/workspace/resizable-video";

// 更新导出类型
export type {
    Scene,
    TextElement,
    ImageElement,
    VideoElement,
    Media,
    ImageMedia,
    VideoMedia,
    AvatarElement,
    Background,
    ColorBackground,
    ImageBackground,
    VideoBackground,
    SelectedElementType
} from "@/types/scene"

// 导入封装的操作函数
import {
    useUndoOperation,
    useRedoOperation,
    useCopyElementOperation,
    usePasteElementOperation,
    useDeleteElementOperation
} from "@/utils/editor-operations"
import { useAnimationMarkers } from "@/hooks/animation-markers-context";

export default function VideoEditor() {
    // 添加复制粘贴相关状态
    const [clipboardItem, setClipboardItem] = useState<{
        type: "text" | "image" | "video" | "avatar";
        data: any;  // 使用 any 类型或者更具体的联合类型
    } | null>(null);
    const [activeTab, setActiveTab] = useState<string>("Script")
    const [activeScene, setActiveScene] = useState<number>(0)
    const [scenes, setScenes] = useState<Scene[]>([
        {
            id: uuidv4(),
            title: "Title",
            media: [
                {
                    id: uuidv4(),
                    type: "image",
                    element: { src: placeholderImage, width: 200, height: 300, x: 0, y: 0, rotation: 0, zIndex: 2 }
                }
            ],
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
                alignment: "center",
                zIndex: 2
            }],
            avatar: null,
            background: {
                type: "color",
                color: "#FFFFFF"
            }
        },
        {
            id: uuidv4(),
            title: "Introduction",
            media: [
                {
                    id: uuidv4(),
                    type: "image",
                    element: { src: placeholderImage, width: 200, height: 300, x: 0, y: 0, rotation: 0 }
                }
            ],
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
                alignment: "center",
                zIndex: 2
            }],
            avatar: null,
            background: {
                type: "color",
                color: "#FFFFFF"
                // Removed z-index comment to avoid confusion
            }
        },
    ])
    const [videoTitle, setVideoTitle] = useState<string>("编辑您的项目名称")
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
    // 添加脚本内容状态
    const [scriptContent, setScriptContent] = useState<string>(
        "use engaging media to grab your audiences attention, or even simulate conversations between multiple avatars. All with an intuitive interface that anyone can use!"
    );
    const handleElementSelect = useCallback((element: SelectedElementType | null) => {
        setSelectedElement(element)

        // Update activeTab based on selected element
        if (element?.type === "text") {
            setActiveTab("Text")
        } else if (element?.type === "avatar") {
            setActiveTab("Avatar")
        } else if (element?.type === "image" || element?.type === "video") {
            setActiveTab("Media")
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
    // 在组件内部使用 useAnimationMarkers
    const { setCurrentSceneId } = useAnimationMarkers();
    // 修改 handleSceneClick 函数，添加设置当前场景ID的逻辑
    const handleSceneClick = useCallback((index: number) => {
        setActiveScene(index);
        setSelectedElement(null);
        // 设置当前场景ID，用于动画标记关联
        setCurrentSceneId(scenes[index].id);
    }, [scenes, setCurrentSceneId]);

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

    // 更新处理图片调整大小的函数
    const handleImageResize = useCallback(
        (newSize: Partial<ImageElement>, mediaId: string) => {
            const newScenes = [...scenes]
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === mediaId)

            if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex].type === "image") {
                const imageMedia = newScenes[activeScene].media[mediaIndex] as ImageMedia;
                imageMedia.element = { ...imageMedia.element, ...newSize } as ImageElement;
                updateHistory(newScenes)
            }
        },
        [scenes, activeScene, updateHistory],
    )

    // 更新处理视频调整大小的函数
    const handleVideoResize = useCallback(
        (newSize: Partial<VideoElement>, mediaId: string) => {
            const newScenes = [...scenes]
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === mediaId)

            if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex].type === "video") {
                const videoMedia = newScenes[activeScene].media[mediaIndex] as VideoMedia;
                videoMedia.element = { ...videoMedia.element, ...newSize } as VideoElement;
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
    // 使用封装的操作函数
    const handleUndo = useUndoOperation(history, historyIndex, setHistoryIndex, setScenes);
    const handleRedo = useRedoOperation(history, historyIndex, setHistoryIndex, setScenes);
    const handleCopyElement = useCopyElementOperation(scenes, activeScene, selectedElement, setClipboardItem);
    const handlePasteElement = usePasteElementOperation(clipboardItem, scenes, activeScene, updateHistory, setSelectedElement);
    const handleDeleteElement = useDeleteElementOperation(scenes, activeScene, selectedElement, updateHistory, setSelectedElement);

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

    // Z-Index 控制函数
    const handleBringToFront = useCallback(() => {
        if (!selectedElement) return;

        const newScenes = bringToFront(scenes, activeScene, selectedElement);
        if (newScenes) {
            updateHistory(newScenes);
        }
    }, [scenes, activeScene, selectedElement, updateHistory]);

    const handleSendToBack = useCallback(() => {
        if (!selectedElement) return;

        const newScenes = sendToBack(scenes, activeScene, selectedElement);
        if (newScenes) {
            updateHistory(newScenes);
        }
    }, [scenes, activeScene, selectedElement, updateHistory]);

    const handleBringForward = useCallback(() => {
        if (!selectedElement) return;

        const newScenes = bringForward(scenes, activeScene, selectedElement);
        if (newScenes) {
            updateHistory(newScenes);
        }
    }, [scenes, activeScene, selectedElement, updateHistory]);

    const handleSendBackward = useCallback(() => {
        if (!selectedElement) return;

        const newScenes = sendBackward(scenes, activeScene, selectedElement);
        if (newScenes) {
            updateHistory(newScenes);
        }
    }, [scenes, activeScene, selectedElement, updateHistory]);

    // 修改渲染Tab内容的函数
    const renderTabContent = () => {
        switch (activeTab) {
            case "Script":
                return <ScriptContent
                    script={scriptContent}
                    setScript={setScriptContent}
                />
            case "Avatar":
                return <AvatarContent />
            case "Background":
                return <BackgroundContent
                    currentBackground={scenes[activeScene].background}
                    onBackgroundChange={handleBackgroundChange}
                />
            // 在 renderTabContent 函数中修改 TextContent 的渲染
            case "Text":
            return <TextContent
            textElement={selectedElement?.type === "text" && selectedElement.index !== undefined
            ? scenes[activeScene].texts[selectedElement.index]
            : undefined}
            onUpdate={handleTextUpdate}
            currentSceneId={scenes[activeScene].id} // 传递当前场景ID
            />
            // Add more cases for other tabs
            default:
                return <div>Content for {activeTab}</div>
        }
    }
    // 在 useEffect 中添加复制粘贴的键盘事件监听
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
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElement) {
                // 复制元素
                e.preventDefault();
                handleCopyElement();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                // 粘贴元素
                e.preventDefault();
                handlePasteElement();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, selectedElement, handleDeleteElement, handleCopyElement, handlePasteElement]);

    const addNewScene = useCallback(() => {
        const newScene: Scene = {
            id : uuidv4(),
            title: `Scene ${scenes.length + 1}`,
            media: [],
            texts: [],  // 初始化为空数组
            avatar: null,
            background: {
                type: "color",
                color: "#FFFFFF"
                // Removed z-index comment to avoid confusion
            }
        }
        updateHistory([...scenes, newScene])
        setActiveScene(scenes.length)
    }, [scenes, updateHistory])

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
    // 在组件挂载时设置初始场景ID
    useEffect(() => {
        if (scenes.length > 0 && activeScene >= 0 && activeScene < scenes.length) {
            setCurrentSceneId(scenes[activeScene].id);
        }
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
                            <BackgroundRenderer
                                background={scenes[activeScene].background}
                                onClick={(e: React.MouseEvent) => {
                                    if (e.target === e.currentTarget) {
                                        setSelectedElement(null)
                                    }
                                }}
                                editorRef={editorRef}
                            >
                                {scenes[activeScene].texts.map((text, index) => (
                                    <ElementContextMenu
                                        key={index}
                                        onBringToFront={handleBringToFront}
                                        onSendToBack={handleSendToBack}
                                        onBringForward={handleBringForward}
                                        onSendBackward={handleSendBackward}
                                        disabled={!(selectedElement?.type === "text" && selectedElement.index === index)}
                                    >
                                        <ResizableText
                                            {...text}
                                            canvasWidth={1920}
                                            canvasHeight={1080}
                                            containerWidth={previewDimensions.width}
                                            containerHeight={previewDimensions.height}
                                            onTextChange={handleTextChange}
                                            onResize={handleTextUpdate}
                                            onSelect={() => handleElementSelect({ type: "text", index })}
                                            isSelected={selectedElement?.type === "text" && selectedElement.index === index}
                                            otherElements={getAllElementsForAlignment(scenes[activeScene], undefined, "text", index)}
                                        />
                                    </ElementContextMenu>
                                ))}
                                {/* 渲染媒体元素 */}
                                {scenes[activeScene].media.map((mediaItem) => {
                                    if (mediaItem.type === "image") {
                                        return (
                                            <ElementContextMenu
                                                key={mediaItem.id}
                                                onBringToFront={handleBringToFront}
                                                onSendToBack={handleSendToBack}
                                                onBringForward={handleBringForward}
                                                onSendBackward={handleSendBackward}
                                                disabled={!(selectedElement?.type === "image" && selectedElement.mediaId === mediaItem.id)}
                                            >
                                                <ResizableImage
                                                    {...(mediaItem as ImageMedia).element}
                                                    onResize={(newSize) => handleImageResize(newSize, mediaItem.id!)}
                                                    onSelect={() => handleElementSelect({ type: "image", mediaId: mediaItem.id })}
                                                    isSelected={selectedElement?.type === "image" && selectedElement.mediaId === mediaItem.id}
                                                    canvasWidth={1920}
                                                    canvasHeight={1080}
                                                    containerWidth={previewDimensions.width}
                                                    containerHeight={previewDimensions.height}
                                                    otherElements={getAllElementsForAlignment(scenes[activeScene], mediaItem.id, "image")}
                                                />
                                            </ElementContextMenu>
                                        );
                                    } else if (mediaItem.type === "video") {
                                        return (
                                            <ElementContextMenu
                                                key={mediaItem.id}
                                                onBringToFront={handleBringToFront}
                                                onSendToBack={handleSendToBack}
                                                onBringForward={handleBringForward}
                                                onSendBackward={handleSendBackward}
                                                disabled={!(selectedElement?.type === "video" && selectedElement.mediaId === mediaItem.id)}
                                            >
                                                <ResizableVideo
                                                    {...(mediaItem as VideoMedia).element}
                                                    onResize={(newSize) => handleVideoResize(newSize, mediaItem.id!)}
                                                    onSelect={() => handleElementSelect({ type: "video", mediaId: mediaItem.id })}
                                                    isSelected={selectedElement?.type === "video" && selectedElement.mediaId === mediaItem.id}
                                                    canvasWidth={1920}
                                                    canvasHeight={1080}
                                                    containerWidth={previewDimensions.width}
                                                    containerHeight={previewDimensions.height}
                                                // otherElements={getAllElementsForAlignment(scenes[activeScene], mediaItem.id, "video")}
                                                />
                                            </ElementContextMenu>
                                        );
                                    }
                                    return null;
                                })}

                                {scenes[activeScene].avatar && (
                                    <ElementContextMenu
                                        onBringToFront={handleBringToFront}
                                        onSendToBack={handleSendToBack}
                                        onBringForward={handleBringForward}
                                        onSendBackward={handleSendBackward}
                                        disabled={!(selectedElement?.type === "avatar")}
                                    >
                                        <ResizableAvatar
                                            {...scenes[activeScene].avatar}
                                            onResize={handleAvatarResize}
                                            onSelect={() => handleElementSelect({ type: "avatar" })}
                                            isSelected={selectedElement?.type === "avatar"}
                                            canvasWidth={1920}
                                            canvasHeight={1080}
                                            containerWidth={previewDimensions.width}
                                            containerHeight={previewDimensions.height}
                                            otherElements={getAllElementsForAlignment(scenes[activeScene], undefined, "avatar")}
                                        />
                                    </ElementContextMenu>
                                )}
                            </BackgroundRenderer>
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

