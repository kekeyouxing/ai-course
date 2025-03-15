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
import { ElementContextMenu } from "@/components/workspace/element-context-menu"

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
    ColorBackground,
    ImageBackground,
    VideoBackground
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

export default function VideoEditor() {
    const [activeTab, setActiveTab] = useState<string>("Script")
    const [activeScene, setActiveScene] = useState<number>(0)
    const [scenes, setScenes] = useState<Scene[]>([
        {
            title: "Title",
            media: [
                {
                    id: uuidv4(),
                    type: "image",
                    element: { src: placeholderImage, width: 200, height: 300, x: 0, y: 0, rotation: 0 }
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
                alignment: "center"
            }],
            avatar: null,
            background: {
                type: "color",
                color: "#FFFFFF"
            }
        },
        {
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
                alignment: "center"
            }],
            avatar: null,
            background: {
                type: "color",
                color: "#FFFFFF"
                // Removed z-index comment to avoid confusion
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

    // 更新删除元素的处理函数
    const handleDeleteElement = useCallback(() => {
        if (!selectedElement) return;

        const newScenes = [...scenes];

        if (selectedElement.type === "text" && selectedElement.index !== undefined) {
            // 删除指定索引的文本元素
            newScenes[activeScene].texts.splice(selectedElement.index, 1);
        } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
            // 删除指定ID的媒体元素
            newScenes[activeScene].media = newScenes[activeScene].media.filter(
                item => item.id !== selectedElement.mediaId
            );
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
    
    // Z-Index 控制函数
    const handleBringToFront = useCallback(() => {
        if (!selectedElement) return;
        
        const newScenes = [...scenes];
        let maxZIndex = 0;
        
        // 找出当前场景中所有元素的最大 zIndex
        // 检查文本元素
        newScenes[activeScene].texts.forEach(text => {
            if (text.zIndex !== undefined && text.zIndex > maxZIndex) {
                maxZIndex = text.zIndex;
            }
        });
        
        // 检查媒体元素
        newScenes[activeScene].media.forEach(media => {
            if (media.type === "image") {
                const imgElement = (media as ImageMedia).element;
                if (imgElement.zIndex !== undefined && imgElement.zIndex > maxZIndex) {
                    maxZIndex = imgElement.zIndex;
                }
            } else if (media.type === "video") {
                const videoElement = (media as VideoMedia).element;
                if (videoElement.zIndex !== undefined && videoElement.zIndex > maxZIndex) {
                    maxZIndex = videoElement.zIndex;
                }
            }
        });
        
        // 检查头像元素
        if (newScenes[activeScene].avatar && newScenes[activeScene].avatar.zIndex !== undefined) {
            if (newScenes[activeScene].avatar.zIndex > maxZIndex) {
                maxZIndex = newScenes[activeScene].avatar.zIndex;
            }
        }
        
        // 设置选中元素的 zIndex 为最大值 + 1
        if (selectedElement.type === "text" && selectedElement.index !== undefined) {
            newScenes[activeScene].texts[selectedElement.index].zIndex = maxZIndex + 1;
        } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === selectedElement.mediaId);
            if (mediaIndex !== -1) {
                if (newScenes[activeScene].media[mediaIndex].type === "image") {
                    (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = maxZIndex + 1;
                } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                    (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = maxZIndex + 1;
                }
            }
        } else if (selectedElement.type === "avatar" && newScenes[activeScene].avatar) {
            newScenes[activeScene].avatar.zIndex = maxZIndex + 1;
        }
        
        updateHistory(newScenes);
    }, [scenes, activeScene, selectedElement, updateHistory]);
    
    const handleSendToBack = useCallback(() => {
        if (!selectedElement) return;
        
        const newScenes = [...scenes];
        // 设置最小 z-index 为 2，确保元素不会低于背景（背景 z-index 为 1）
        let minZIndex = 2;
        
        // 找出当前场景中所有元素的最小 zIndex
        // 检查文本元素
        newScenes[activeScene].texts.forEach(text => {
            if (text.zIndex !== undefined && text.zIndex < minZIndex && text.zIndex >= 2) {
                minZIndex = text.zIndex;
            }
        });
        
        // 检查媒体元素
        newScenes[activeScene].media.forEach(media => {
            if (media.type === "image") {
                const imgElement = (media as ImageMedia).element;
                if (imgElement.zIndex !== undefined && imgElement.zIndex < minZIndex && imgElement.zIndex >= 2) {
                    minZIndex = imgElement.zIndex;
                }
            } else if (media.type === "video") {
                const videoElement = (media as VideoMedia).element;
                if (videoElement.zIndex !== undefined && videoElement.zIndex < minZIndex && videoElement.zIndex >= 2) {
                    minZIndex = videoElement.zIndex;
                }
            }
        });
        
        // 检查头像元素
        if (newScenes[activeScene].avatar && newScenes[activeScene].avatar.zIndex !== undefined) {
            if (newScenes[activeScene].avatar.zIndex < minZIndex && newScenes[activeScene].avatar.zIndex >= 2) {
                minZIndex = newScenes[activeScene].avatar.zIndex;
            }
        }
        
        // 设置选中元素的 zIndex 为 2（最小可能值，确保在背景之上）
        const newZIndex = Math.max(2, minZIndex - 1);
        
        if (selectedElement.type === "text" && selectedElement.index !== undefined) {
            newScenes[activeScene].texts[selectedElement.index].zIndex = newZIndex;
        } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === selectedElement.mediaId);
            if (mediaIndex !== -1) {
                if (newScenes[activeScene].media[mediaIndex].type === "image") {
                    (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = newZIndex;
                } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                    (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = newZIndex;
                }
            }
        } else if (selectedElement.type === "avatar" && newScenes[activeScene].avatar) {
            newScenes[activeScene].avatar.zIndex = newZIndex;
        }
        
        updateHistory(newScenes);
    }, [scenes, activeScene, selectedElement, updateHistory]);
    
    const handleBringForward = useCallback(() => {
        if (!selectedElement) return;
        
        const newScenes = [...scenes];
        let currentZIndex = 0;
        
        // 获取当前选中元素的 zIndex
        if (selectedElement.type === "text" && selectedElement.index !== undefined) {
            currentZIndex = newScenes[activeScene].texts[selectedElement.index].zIndex || 0;
        } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === selectedElement.mediaId);
            if (mediaIndex !== -1) {
                if (newScenes[activeScene].media[mediaIndex].type === "image") {
                    currentZIndex = (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex || 0;
                } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                    currentZIndex = (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex || 0;
                }
            }
        } else if (selectedElement.type === "avatar" && newScenes[activeScene].avatar) {
            currentZIndex = newScenes[activeScene].avatar.zIndex || 0;
        }
        
        // 收集当前场景中所有元素的 zIndex
        const allElements: {type: string, index?: number, mediaId?: string, zIndex: number}[] = [];
        
        // 收集文本元素
        newScenes[activeScene].texts.forEach((text, index) => {
            allElements.push({
                type: "text",
                index,
                zIndex: text.zIndex || 0
            });
        });
        
        // 收集媒体元素
        newScenes[activeScene].media.forEach((media) => {
            if (media.type === "image") {
                allElements.push({
                    type: "image",
                    mediaId: media.id,
                    zIndex: (media as ImageMedia).element.zIndex || 0
                });
            } else if (media.type === "video") {
                allElements.push({
                    type: "video",
                    mediaId: media.id,
                    zIndex: (media as VideoMedia).element.zIndex || 0
                });
            }
        });
        
        // 收集头像元素
        if (newScenes[activeScene].avatar) {
            allElements.push({
                type: "avatar",
                zIndex: newScenes[activeScene].avatar.zIndex || 0
            });
        }
        
        // 按 zIndex 排序
        allElements.sort((a, b) => a.zIndex - b.zIndex);
        
        // 找到当前元素在排序后数组中的位置
        let currentIndex = -1;
        for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            if (el.type === selectedElement.type) {
                if (el.type === "text" && el.index === selectedElement.index) {
                    currentIndex = i;
                    break;
                } else if ((el.type === "image" || el.type === "video") && el.mediaId === selectedElement.mediaId) {
                    currentIndex = i;
                    break;
                } else if (el.type === "avatar") {
                    currentIndex = i;
                    break;
                }
            }
        }
        
        // 如果当前元素已经是最顶层，则不需要操作
        if (currentIndex === allElements.length - 1) {
            return;
        }
        
        // 获取上一层元素的 zIndex
        const nextElement = allElements[currentIndex + 1];
        const newZIndex = nextElement.zIndex + 1;
        
        // 更新当前元素的 zIndex
        if (selectedElement.type === "text" && selectedElement.index !== undefined) {
            newScenes[activeScene].texts[selectedElement.index].zIndex = newZIndex;
        } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === selectedElement.mediaId);
            if (mediaIndex !== -1) {
                if (newScenes[activeScene].media[mediaIndex].type === "image") {
                    (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = newZIndex;
                } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                    (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = newZIndex;
                }
            }
        } else if (selectedElement.type === "avatar" && newScenes[activeScene].avatar) {
            newScenes[activeScene].avatar.zIndex = newZIndex;
        }
        
        updateHistory(newScenes);
    }, [scenes, activeScene, selectedElement, updateHistory]);
    
    const handleSendBackward = useCallback(() => {
        if (!selectedElement) return;
        
        const newScenes = [...scenes];
        let currentZIndex = 0;
        
        // 获取当前选中元素的 zIndex
        if (selectedElement.type === "text" && selectedElement.index !== undefined) {
            currentZIndex = newScenes[activeScene].texts[selectedElement.index].zIndex || 0;
        } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === selectedElement.mediaId);
            if (mediaIndex !== -1) {
                if (newScenes[activeScene].media[mediaIndex].type === "image") {
                    currentZIndex = (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex || 0;
                } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                    currentZIndex = (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex || 0;
                }
            }
        } else if (selectedElement.type === "avatar" && newScenes[activeScene].avatar) {
            currentZIndex = newScenes[activeScene].avatar.zIndex || 0;
        }
        
        // 收集当前场景中所有元素的 zIndex
        const allElements: {type: string, index?: number, mediaId?: string, zIndex: number}[] = [];
        
        // 收集文本元素
        newScenes[activeScene].texts.forEach((text, index) => {
            allElements.push({
                type: "text",
                index,
                zIndex: text.zIndex || 0
            });
        });
        
        // 收集媒体元素
        newScenes[activeScene].media.forEach((media) => {
            if (media.type === "image") {
                allElements.push({
                    type: "image",
                    mediaId: media.id,
                    zIndex: (media as ImageMedia).element.zIndex || 0
                });
            } else if (media.type === "video") {
                allElements.push({
                    type: "video",
                    mediaId: media.id,
                    zIndex: (media as VideoMedia).element.zIndex || 0
                });
            }
        });
        
        // 收集头像元素
        if (newScenes[activeScene].avatar) {
            allElements.push({
                type: "avatar",
                zIndex: newScenes[activeScene].avatar.zIndex || 0
            });
        }
        
        // 按 zIndex 排序
        allElements.sort((a, b) => a.zIndex - b.zIndex);
        
        // 找到当前元素在排序后数组中的位置
        let currentIndex = -1;
        for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            if (el.type === selectedElement.type) {
                if (el.type === "text" && el.index === selectedElement.index) {
                    currentIndex = i;
                    break;
                } else if ((el.type === "image" || el.type === "video") && el.mediaId === selectedElement.mediaId) {
                    currentIndex = i;
                    break;
                } else if (el.type === "avatar") {
                    currentIndex = i;
                    break;
                }
            }
        }
        
        // 如果当前元素已经是最底层或者只有一个元素，则不需要操作
        if (currentIndex <= 0 || allElements.length <= 1) {
            return;
        }
        
        // 获取下一层元素的 zIndex
        const prevElement = allElements[currentIndex - 1];
        // 确保 z-index 不低于 2（背景的 z-index 为 1）
        const newZIndex = Math.max(2, prevElement.zIndex - 1);
        
        // 更新当前元素的 zIndex
        if (selectedElement.type === "text" && selectedElement.index !== undefined) {
            newScenes[activeScene].texts[selectedElement.index].zIndex = newZIndex;
        } else if ((selectedElement.type === "image" || selectedElement.type === "video") && selectedElement.mediaId) {
            const mediaIndex = newScenes[activeScene].media.findIndex(item => item.id === selectedElement.mediaId);
            if (mediaIndex !== -1) {
                if (newScenes[activeScene].media[mediaIndex].type === "image") {
                    (newScenes[activeScene].media[mediaIndex] as ImageMedia).element.zIndex = newZIndex;
                } else if (newScenes[activeScene].media[mediaIndex].type === "video") {
                    (newScenes[activeScene].media[mediaIndex] as VideoMedia).element.zIndex = newZIndex;
                }
            }
        } else if (selectedElement.type === "avatar" && newScenes[activeScene].avatar) {
            newScenes[activeScene].avatar.zIndex = newZIndex;
        }
        
        updateHistory(newScenes);
    }, [scenes, activeScene, selectedElement, updateHistory]);

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
    // 添加处理媒体添加的函数
    // 添加处理媒体添加的函数
    const handleAddMedia = useCallback(
        (mediaType: "image" | "video", src: string) => {
            const newScenes = [...scenes];
            const mediaId = uuidv4();

            if (mediaType === "image") {
                newScenes[activeScene].media.push({
                    id: mediaId,
                    type: "image",
                    element: {
                        src,
                        width: 400,
                        height: 300,
                        x: 1920 / 2 - 200, // 居中
                        y: 1080 / 2 - 150, // 居中
                        rotation: 0
                    }
                });

                // 选中新添加的图片元素
                setSelectedElement({
                    type: "image",
                    mediaId
                });
            } else if (mediaType === "video") {
                newScenes[activeScene].media.push({
                    id: mediaId,
                    type: "video",
                    element: {
                        src,
                        width: 400,
                        height: 300,
                        x: 1920 / 2 - 200, // 居中
                        y: 1080 / 2 - 150, // 居中
                        rotation: 0,
                        volume: 1,
                        autoPlay: true,
                        loop: true,
                        muted: false
                    }
                });

                // 选中新添加的视频元素
                setSelectedElement({
                    type: "video",
                    mediaId
                });
            }

            updateHistory(newScenes);
            setActiveTab("Media");
        },
        [scenes, activeScene, updateHistory]
    );

    const addNewScene = useCallback(() => {
        const newScene: Scene = {
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
                                    backgroundPosition: "center",
                                    zIndex: 1 // 设置背景的 z-index 为 1
                                }}
                                data-width="1920"
                                data-height="1080"
                                onClick={(e: React.MouseEvent) => {
                                    if (e.target === e.currentTarget) {
                                        setSelectedElement(null)
                                    }
                                }}
                            >
                                {/* Z-Index Controls - Only show when an element is selected */}
                                {/* Removed fixed position Z-Index Controls as they're now in the context menu */}
                            
                                {/* 如果背景是视频类型，添加视频元素 */}
                                {scenes[activeScene].background.type === "video" && (
                                    <video
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ zIndex: 1 }} /* 设置视频背景的 z-index 为 1 */
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
                                        />
                                    </ElementContextMenu>
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

