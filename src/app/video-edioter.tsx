"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import ScriptContent from "@/components/script/script-content";
import { BackgroundContent } from "@/components/background/background-content";
import { BackgroundRenderer } from "@/components/background/background-renderer";
import { VideoHeader } from "@/components/workspace/workspace-header";
import { VideoTimeline } from "@/components/workspace/workspace-timeline";
import { VideoTabs } from "@/components/workspace/workspace-tabs";
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
    AspectRatioType,
} from "@/types/scene"
import { v4 as uuidv4 } from 'uuid';
import { ResizableVideo } from "@/components/workspace/resizable-video";
import { ContentMediaItem } from "@/components/media/media-content";
import VideoContent from "@/components/media/video-content"; // 添加 VideoContent 导入
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
    SelectedElementType,
    AspectRatioType  // 导出新添加的类型
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
// 导入 MediaContent 和类型
import MediaContent from "@/components/media/media-content";

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
            media: [],
            texts: [],
            avatar: null,
            background: {
                type: "color",
                color: "#FFFFFF"
            },
            script: "这是第一个场景的脚本内容",  // 添加脚本内容
            aspectRatio: "16:9"  // 添加默认宽高比例
        },
        {
            id: uuidv4(),
            title: "Introduction",
            media: [],
            texts: [],
            avatar: null,
            background: {
                type: "color",
                color: "#FFFFFF"
            },
            script: "这是第二个场景的脚本内容",  // 添加脚本内容
            aspectRatio: "16:9"  // 添加默认宽高比例
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
    // 添加比例状态，默认为16:9
    const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(() => {
        // 初始化时，如果有场景且场景有aspectRatio，则使用场景的aspectRatio
        return scenes[0]?.aspectRatio || "16:9";
    });
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
    // 修改获取当前画布尺寸的逻辑，优先使用当前场景的宽高比例
    const getCurrentAspectRatio = () => {
        // 如果当前场景有设置宽高比例，则使用场景的设置
        if (scenes[activeScene]?.aspectRatio) {
            return scenes[activeScene].aspectRatio;
        }
        // 否则使用全局设置的宽高比例
        return aspectRatio;
    };

    // 获取当前画布尺寸
    const currentAspectRatio = getCurrentAspectRatio();
    // 添加画布尺寸常量
    const CANVAS_DIMENSIONS = {
        "16:9": { width: 1920, height: 1080 },
        "9:16": { width: 1080, height: 1920 },
        "1:1": { width: 1080, height: 1080 },
        "4:3": { width: 1440, height: 1080 }
    };

    // 获取当前画布尺寸
    const currentCanvasDimensions = CANVAS_DIMENSIONS[currentAspectRatio];
    // 在组件内部使用 useAnimationMarkers
    const { setCurrentSceneId } = useAnimationMarkers();
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
    // 场景切换
    const handleSceneClick = useCallback((index: number) => {
        setActiveScene(index);
        setSelectedElement(null);
        // 设置当前场景ID，用于动画标记关联
        setCurrentSceneId(scenes[index].id);

        // 设置当前场景的宽高比例
        if (scenes[index].aspectRatio) {
            setAspectRatio(scenes[index].aspectRatio);
        }
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

    // 添加处理文本类型选择的函数 - 更改为更直观的名称
    const handleAddTextElement = useCallback(
        (type: "title" | "subtitle" | "body") => {
            const newScenes = [...scenes]
            // 创建新的文本元素
            const newText: TextElement = {
                content: type === "title" ? "标题" : type === "subtitle" ? "副标题" : "正文",
                fontSize: type === "title" ? 216 : type === "subtitle" ? 130 : 65,
                x: currentCanvasDimensions.width / 2 - 400, // 使用当前画布宽度水平居中
                y: currentCanvasDimensions.height / 2 - 100, // 使用当前画布高度垂直居中
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
    const handleAddMedia = useCallback((mediaItem: ContentMediaItem) => {
        const newScenes = [...scenes];

        // Create media element with proper typing
        if (mediaItem.type === "image") {
            // Create image media with correct type
            const newImageMedia: ImageMedia = {
                id: uuidv4(),
                type: "image",
                element: {
                    src: mediaItem.src,
                    width: 400,
                    height: 300,
                    x: currentCanvasDimensions.width / 2 - 200,
                    y: currentCanvasDimensions.height / 2 - 150,
                    rotation: 0,
                    zIndex: 10
                }
            };

            // Add to current scene
            newScenes[activeScene].media.push(newImageMedia);

            // Update history and select the new element
            updateHistory(newScenes);
            setSelectedElement({
                type: "image",
                mediaId: newImageMedia.id
            });
        } else if (mediaItem.type === "video") {
            // Create video media with correct type
            const newVideoMedia: VideoMedia = {
                id: uuidv4(),
                type: "video",
                element: {
                    src: mediaItem.src,
                    width: 400,
                    height: 300,
                    x: currentCanvasDimensions.width / 2 - 200,
                    y: currentCanvasDimensions.height / 2 - 150,
                    rotation: 0,
                    zIndex: 10,
                    volume: 0.5,
                    loop: false,
                    autoplay: true,
                    displayMode: "freeze",
                    thumbnail: "",
                    duration: "00:00"
                }
            };

            // Add to current scene
            newScenes[activeScene].media.push(newVideoMedia);

            // Update history and select the new element
            updateHistory(newScenes);
            setSelectedElement({
                type: "video",
                mediaId: newVideoMedia.id
            });
        }

        // Switch to Media tab
        setActiveTab("Media");
    }, [scenes, activeScene, updateHistory, currentCanvasDimensions]);
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
    // 添加处理脚本更新的函数
    const handleScriptUpdate = useCallback((newScript: string) => {
        const newScenes = [...scenes];
        newScenes[activeScene].script = newScript;
        updateHistory(newScenes);
    }, [scenes, activeScene, updateHistory]);
    // 获取当前选中的媒体元素
    const getSelectedMedia = useCallback(() => {
        if (!selectedElement || (selectedElement.type !== "image" && selectedElement.type !== "video")) {
            return null;
        }

        const mediaId = selectedElement.mediaId;
        const mediaItem = scenes[activeScene].media.find(item => item.id === mediaId);

        if (!mediaItem) return null;

        return mediaItem;
    }, [selectedElement, scenes, activeScene]);
    // 添加处理图片更新的函数
    const handleImageUpdate = useCallback(
        (mediaId: string, updates: Partial<ImageElement>) => {
            const newScenes = [...scenes];
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === mediaId);

            if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex].type === "image") {
                const imageMedia = newScenes[activeScene].media[mediaIndex] as ImageMedia;
                imageMedia.element = { ...imageMedia.element, ...updates } as ImageElement;
                updateHistory(newScenes);
            }
        },
        [scenes, activeScene, updateHistory]
    );

    // 添加处理视频更新的函数
    const handleVideoUpdate = useCallback(
        (mediaId: string, updates: Partial<VideoElement>) => {
            const newScenes = [...scenes];
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === mediaId);

            if (mediaIndex !== -1 && newScenes[activeScene].media[mediaIndex].type === "video") {
                const videoMedia = newScenes[activeScene].media[mediaIndex] as VideoMedia;
                videoMedia.element = { ...videoMedia.element, ...updates } as VideoElement;
                updateHistory(newScenes);
            }
        },
        [scenes, activeScene, updateHistory]
    );
    // 修改渲染Tab内容的函数
    // 添加处理头像选择的函数
    const handleSelectAvatar = useCallback((avatarSrc: string) => {
        const newScenes = [...scenes];
        
        // 创建新的头像元素或更新现有头像
        const newAvatar: AvatarElement = {
            src: avatarSrc,
            width: 400,
            height: 400,
            x: currentCanvasDimensions.width / 2 - 200, // 居中放置
            y: currentCanvasDimensions.height / 2 - 200,
            rotation: 0,
            zIndex: 10,
        };
        
        // 更新当前场景的头像
        newScenes[activeScene].avatar = newAvatar;
        
        // 更新历史记录
        updateHistory(newScenes);
        
        // 选中新添加的头像元素
        setSelectedElement({
            type: "avatar"
        });
        
    }, [scenes, activeScene, updateHistory, currentCanvasDimensions]);

    // 修改渲染Tab内容的函数
    const renderTabContent = () => {
        switch (activeTab) {
            case "Script":
                return <ScriptContent
                    script={scenes[activeScene].script || ""}
                    setScript={handleScriptUpdate}
                />
            case "Avatar":
                return <AvatarContent 
                    onSelectAvatar={handleSelectAvatar}
                />
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
                    currentSceneId={scenes[activeScene].id} // 传递当前场景ID
                />
            case "Media":
                return <MediaContent
                    onAddMedia={handleAddMedia}
                    onUpdateImage={handleImageUpdate}
                    onUpdateVideo={handleVideoUpdate}
                    selectedMedia={getSelectedMedia()}
                    currentSceneId={scenes[activeScene].id}
                    onDelete={handleDeleteElement}
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

    // 修改添加新场景的函数，包含当前选择的宽高比例
    const addNewScene = useCallback(() => {
        const newScene: Scene = {
            id: uuidv4(),
            title: `Scene ${scenes.length + 1}`,
            media: [],
            texts: [],  // 初始化为空数组
            avatar: null,
            background: {
                type: "color",
                color: "#FFFFFF"
            },
            script: "",  // 确保添加空脚本字段
            aspectRatio: aspectRatio  // 使用当前选择的宽高比例
        }
        updateHistory([...scenes, newScene])
        setActiveScene(scenes.length)
    }, [scenes, updateHistory, aspectRatio])

    // 添加 editorRef
    const editorRef = useRef<HTMLDivElement>(null);
    // 添加预览容器尺寸状态，初始化为当前比例对应的尺寸
    const [previewDimensions, setPreviewDimensions] = useState(() => {
        // 使用函数形式的初始化，确保只在组件挂载时执行一次
        return {
            width: currentCanvasDimensions.width,
            height: currentCanvasDimensions.height
        };
    });
    // 使用 ResizeObserver 监听预览容器尺寸变化
    useEffect(() => {
        if (!editorRef.current) return;

        // 获取固定的容器元素 - 这里应该是编辑区域的主容器
        const mainContainer = document.querySelector('.flex-1.flex.items-center.justify-center.p-4');
        if (!mainContainer) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;

                // 确保宽高不为0
                if (width === 0 || height === 0) continue;

                // 获取当前画布比例
                const canvasRatio = currentCanvasDimensions.width / currentCanvasDimensions.height;

                // 根据容器尺寸和画布比例计算预览尺寸
                const containerRatio = width / height;
                let previewWidth, previewHeight;

                if (containerRatio > canvasRatio) {
                    // 容器更宽，以高度为基准
                    previewHeight = height * 0.9; // 留一些边距
                    previewWidth = previewHeight * canvasRatio;
                } else {
                    // 容器更高，以宽度为基准
                    previewWidth = width * 0.9; // 留一些边距
                    previewHeight = previewWidth / canvasRatio;
                }

                setPreviewDimensions({
                    width: previewWidth,
                    height: previewHeight
                });
            }
        });

        // 观察固定的主容器
        resizeObserver.observe(mainContainer);

        return () => {
            resizeObserver.disconnect();
        };
    }, [aspectRatio, currentCanvasDimensions]);
    // 在组件挂载时设置初始场景ID
    useEffect(() => {
        if (scenes.length > 0 && activeScene >= 0 && activeScene < scenes.length) {
            setCurrentSceneId(scenes[activeScene].id);
        }
    }, []);

    // 修改宽高比例变化处理函数，同时更新当前场景的宽高比例
    const handleAspectRatioChange = useCallback((newRatio: AspectRatioType) => {
        setAspectRatio(newRatio);

        // 更新当前场景的宽高比例
        const newScenes = [...scenes];
        newScenes[activeScene].aspectRatio = newRatio;
        updateHistory(newScenes);

        // 获取固定的容器元素
        const mainContainer = document.querySelector('.flex-1.flex.items-center.justify-center.p-4');
        if (!mainContainer) return;

        // 获取容器尺寸
        const { width, height } = mainContainer.getBoundingClientRect();

        // 获取新比例的画布尺寸
        const newCanvasDimensions = CANVAS_DIMENSIONS[newRatio];
        const newCanvasRatio = newCanvasDimensions.width / newCanvasDimensions.height;

        // 根据容器尺寸和新画布比例计算预览尺寸
        const containerRatio = width / height;
        let previewWidth, previewHeight;

        if (containerRatio > newCanvasRatio) {
            // 容器更宽，以高度为基准
            previewHeight = height * 0.9; // 留一些边距
            previewWidth = previewHeight * newCanvasRatio;
        } else {
            // 容器更高，以宽度为基准
            previewWidth = width * 0.9; // 留一些边距
            previewHeight = previewWidth / newCanvasRatio;
        }

        setPreviewDimensions({
            width: previewWidth,
            height: previewHeight
        });
    }, [CANVAS_DIMENSIONS, scenes, activeScene, updateHistory]);

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
                currentScene={scenes[activeScene]}
                scenes={scenes}
                activeSceneIndex={activeScene}
                aspectRatio={aspectRatio}
                onAspectRatioChange={handleAspectRatioChange}
            />

            <VideoTabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSelectTextType={handleAddTextElement} // 更新引用
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
                                style={{
                                    width: previewDimensions.width,
                                    height: previewDimensions.height,
                                    position: 'relative',
                                    transition: 'width 0.3s, height 0.3s'
                                }}
                                className="shadow-md"
                            >
                                <BackgroundRenderer
                                    background={scenes[activeScene].background}
                                    onClick={(e: React.MouseEvent) => {
                                        if (e.target === e.currentTarget) {
                                            setSelectedElement(null)
                                        }
                                    }}
                                    editorRef={editorRef}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        overflow: 'hidden' // 确保内容不溢出
                                    }}
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
                                                canvasWidth={currentCanvasDimensions.width}
                                                canvasHeight={currentCanvasDimensions.height}
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
                                                        canvasWidth={currentCanvasDimensions.width}
                                                        canvasHeight={currentCanvasDimensions.height}
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
                                                        canvasWidth={currentCanvasDimensions.width}
                                                        canvasHeight={currentCanvasDimensions.height}
                                                        containerWidth={previewDimensions.width}
                                                        containerHeight={previewDimensions.height}
                                                        otherElements={getAllElementsForAlignment(scenes[activeScene], mediaItem.id, "video")}
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
                                                canvasWidth={currentCanvasDimensions.width}
                                                canvasHeight={currentCanvasDimensions.height}
                                                containerWidth={previewDimensions.width}
                                                containerHeight={previewDimensions.height}
                                                otherElements={getAllElementsForAlignment(scenes[activeScene], undefined, "avatar")}
                                            />
                                        </ElementContextMenu>
                                    )}
                                </BackgroundRenderer>
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

