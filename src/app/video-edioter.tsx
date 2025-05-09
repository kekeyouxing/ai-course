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
import { getAllElementsForAlignment } from "@/utils/alignment-utils";
import { useZIndexOperations } from "@/hooks/use-zindex-operations";
import { usePreviewDimensions } from "@/hooks/use-preview-dimensions";
import { useCanvasDimensions } from "@/hooks/use-canvas-dimensions";
import { ShapeContent } from "@/components/workspace/shape-content";
import { ResizableShape } from "@/components/workspace/resizable-shape"
// 导入类型定义
import {
    Scene,
    ImageMedia,
    VideoMedia,
    SelectedElementType,
    AspectRatioType,
    ShapeElement,
    ShapeType,
    Project
} from "@/types/scene"
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
// 导入 MediaContent 和类型
import MediaContent from "@/components/media/media-content";
import { getScenesByProjectId, updateSceneTitle, deleteScene, updateScene, createScene, duplicateScene } from "@/api/scene";
import { updateProject as apiUpdateProject } from "@/api/project";
import { toast } from "sonner";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useElementOperations } from "@/hooks/use-element-operations";

// 导入防抖更新Hook
import { useDebouncedSceneUpdate } from "@/hooks/use-debounced-update";

export default function VideoEditor() {
    // 添加加载状态
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // 添加复制粘贴相关状态
    const [clipboardItem, setClipboardItem] = useState<{
        type: "text" | "image" | "video" | "avatar" | "shape";
        data: any;  // 使用 any 类型或者更具体的联合类型
    } | null>(null);
    const [activeTab, setActiveTab] = useState<string>("Script")
    const [activeScene, setActiveScene] = useState<number>(0)
    const [scenes, setScenes] = useState<Scene[]>([])
    // 添加项目状态管理
    const [projectData, setProjectData] = useState<Project | null>(null)

    const [videoTitle, setVideoTitle] = useState<string>("")
    const tabs: string[] = [
        "Script",
        "Avatar",
        "Background",
        "Media",
        "Text",
        "Shape",
    ]
    const [history, setHistory] = useState<Scene[][]>([scenes])
    const [historyIndex, setHistoryIndex] = useState<number>(0)
    const [selectedElement, setSelectedElement] = useState<SelectedElementType | null>(null)
    // 添加比例状态，默认为16:9
    const {
        aspectRatio,
        setAspectRatio,
        getCurrentAspectRatio,
        CANVAS_DIMENSIONS
    } = useCanvasDimensions(scenes);


    // 获取当前画布尺寸
    const currentAspectRatio = getCurrentAspectRatio(scenes, activeScene);
    // 获取当前画布尺寸
    const currentCanvasDimensions = CANVAS_DIMENSIONS[currentAspectRatio];
    const { id: projectId } = useParams<{ id: string }>();
    // 添加 editorRef
    const editorRef = useRef<HTMLDivElement>(null);
    // 添加预览容器尺寸状态，初始化为当前比例对应的尺寸
    const { previewDimensions, setPreviewDimensions } = usePreviewDimensions(editorRef, currentAspectRatio);
    const navigate = useNavigate();
    const location = useLocation();
    const project = location.state?.project;

    // 初始化防抖更新方法
    const debouncedUpdateScene = useDebouncedSceneUpdate();

    useEffect(() => {
        const fetchScenes = async () => {
            setIsLoading(true); // 开始加载
            try {
                const scenesWithDates = projectId ? await getScenesByProjectId(projectId) : [];
                // 如果有 projectId 但没有找到场景数据，重定向到 404 页面
                if (projectId && (!scenesWithDates || scenesWithDates.length === 0)) {
                    navigate("/404"); // 使用 navigate 进行重定向
                    return;
                }
                setScenes(scenesWithDates);

                // 设置宽高比
                const initialAspectRatio = scenesWithDates[0]?.aspectRatio || "16:9";

                setAspectRatio(initialAspectRatio);
                setHistory([scenesWithDates]);
                if (project) {
                    // 可以直接使用项目数据
                    setVideoTitle(project.name); // 例如设置视频标题
                }
                // 等待DOM更新后计算预览尺寸
                setTimeout(() => {
                    // 获取容器元素
                    const mainContainer = document.querySelector('.flex-1.flex.items-center.justify-center.p-4');
                    if (mainContainer) {
                        // 获取容器尺寸
                        const { width, height } = mainContainer.getBoundingClientRect();

                        // 获取画布尺寸
                        const canvasDimensions = CANVAS_DIMENSIONS[initialAspectRatio];
                        const canvasRatio = canvasDimensions.width / canvasDimensions.height;

                        // 计算预览尺寸
                        let previewWidth, previewHeight;
                        const containerRatio = width / height;

                        if (containerRatio > canvasRatio) {
                            // 容器更宽，以高度为基准
                            previewHeight = height * 0.9; // 留一些边距
                            previewWidth = previewHeight * canvasRatio;
                        } else {
                            // 容器更高，以宽度为基准
                            previewWidth = width * 0.9; // 留一些边距
                            previewHeight = previewWidth / canvasRatio;
                        }

                        // 更新预览尺寸
                        setPreviewDimensions({
                            width: previewWidth,
                            height: previewHeight
                        });
                    }
                }, 100); // 短暂延迟确保DOM已更新
            } catch (error) {
                console.error("获取场景失败:", error);
                toast.error("无法加载项目场景");
            } finally {
                setIsLoading(false); // 结束加载
            }
        };

        if (projectId) {
            fetchScenes();
        }
    }, [projectId, CANVAS_DIMENSIONS, setAspectRatio, setPreviewDimensions]);

    const handleElementSelect = useCallback((element: SelectedElementType | null) => {
        // 先清除当前选中的元素，再设置新的选中元素
        // 这样可以防止不同元素之间的状态混乱
        setSelectedElement(null);
        // 使用setTimeout确保状态清除后再设置新状态
        setTimeout(() => {
            setSelectedElement(element);
            
            // Update activeTab based on selected element
            if (element?.type === "text") {
                setActiveTab("Text");
            } else if (element?.type === "avatar") {
                setActiveTab("Avatar");
            } else if (element?.type === "image" || element?.type === "video") {
                setActiveTab("Media");
            } else if (element?.type === "shape") {
                setActiveTab("Shape");
            }
        }, 0);
    }, [setActiveTab]);

    // 修改updateHistory函数，添加后端同步
    const updateHistory = useCallback(
        (newScenes: Scene[]) => {
            // 如果当前不在历史记录的最后，则截断历史记录
            const newHistory = history.slice(0, historyIndex + 1)
            // 添加新的状态到历史记录
            newHistory.push(JSON.parse(JSON.stringify(newScenes))) // 深拷贝确保状态独立
            setHistory(newHistory)
            setHistoryIndex(newHistory.length - 1)
            setScenes(JSON.parse(JSON.stringify(newScenes))) // 确保状态更新
            
            // 与后端同步当前场景的更改
            if (activeScene < newScenes.length && newScenes[activeScene]?.id) {
                debouncedUpdateScene(newScenes[activeScene].id, newScenes[activeScene]);
            }
        },
        [history, historyIndex, activeScene, debouncedUpdateScene],
    )

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

    // 使用元素操作 hook
    const {
        handleTextChange,
        handleTextUpdate,
        handleAddTextElement,
        handleImageResize,
        handleImageUpdate,
        handleVideoResize,
        handleVideoUpdate,
        handleAvatarResize,
        handleSelectAvatar,
        handleAddMedia,
        getSelectedMedia,
        handleBackgroundChange,
        handleShapeUpdate,
        handleAddShapeElement
    } = useElementOperations(
        scenes,
        activeScene,
        updateHistory,
        setSelectedElement,
        setActiveTab,
        currentCanvasDimensions,
        selectedElement
    );
    // 场景切换
    const handleSceneClick = useCallback((index: number) => {
        // 清除当前选中的元素，避免在新场景中找不到相同索引的元素
        setSelectedElement(null);
        
        setActiveScene(index);

        // 设置当前场景的宽高比例
        if (scenes[index].aspectRatio) {
            setAspectRatio(scenes[index].aspectRatio);
        }
    }, [scenes, setAspectRatio]);

    // 使用封装的操作函数
    const handleUndo = useUndoOperation(history, historyIndex, setHistoryIndex, setScenes);
    const handleRedo = useRedoOperation(history, historyIndex, setHistoryIndex, setScenes);
    const handleCopyElement = useCopyElementOperation(scenes, activeScene, selectedElement, setClipboardItem);
    const handlePasteElement = usePasteElementOperation(clipboardItem, scenes, activeScene, updateHistory, setSelectedElement);
    const handleDeleteElement = useDeleteElementOperation(scenes, activeScene, selectedElement, updateHistory, setSelectedElement);
    // 替换原有的 z-index 操作方法
    const {
        handleBringToFront,
        handleSendToBack,
        handleBringForward,
        handleSendBackward
    } = useZIndexOperations(scenes, activeScene, selectedElement, updateHistory);

    // 添加项目更新的处理函数
    const handleUpdateProject = useCallback(async (updates: Partial<Project>) => {
        if (!projectId) return;

        try {
            // 调用API更新项目
            await apiUpdateProject(projectId, updates);
            
            // 更新本地状态
            if (projectData) {
                setProjectData({
                    ...projectData,
                    ...updates,
                    updatedAt: new Date()
                });
            }
        } catch (error) {
            console.error("更新项目失败:", error);
            toast.error("更新项目失败，请重试");
        }
    }, [projectId, projectData]);

    // 修改渲染Tab内容的函数
    const renderTabContent = () => {
        switch (activeTab) {
            case "Script":
                return <ScriptContent
                    scene={scenes[activeScene]}
                    project={projectData || {
                        id: projectId || '',
                        name: videoTitle,
                        scenes: scenes,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        status: 'draft'
                    }}
                    updateScene={(updates) => {
                        const newScenes = [...scenes];
                        newScenes[activeScene] = {
                            ...newScenes[activeScene],
                            ...updates
                        };
                        updateHistory(newScenes);
                    }}
                    updateProject={handleUpdateProject}
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
                    textElement={selectedElement?.type === "text" && selectedElement.index !== undefined &&
                        Array.isArray(scenes[activeScene].texts) && selectedElement.index < scenes[activeScene].texts.length
                        ? scenes[activeScene].texts[selectedElement.index]
                        : undefined}
                    onUpdate={handleTextUpdate}
                    sceneId={scenes[activeScene].id} // 添加场景ID
                />
            case "Media":
                return <MediaContent
                    onAddMedia={handleAddMedia}
                    onUpdateImage={handleImageUpdate}
                    onUpdateVideo={handleVideoUpdate}
                    selectedMedia={getSelectedMedia()}
                    sceneId={scenes[activeScene].id}
                    onDelete={handleDeleteElement}
                />
            case "Shape":
                return <ShapeContent
                    shape={
                        selectedElement?.type === "shape" && selectedElement.index !== undefined &&
                        Array.isArray(scenes[activeScene]?.shapes) ? 
                        scenes[activeScene]?.shapes[selectedElement.index] : 
                        undefined
                    }
                    onUpdate={handleShapeUpdate}
                    sceneId={scenes[activeScene]?.id}
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
    const addNewScene = useCallback(async () => {
        try {
            const newSceneData: Partial<Scene> = {
                title: `Scene ${scenes.length + 1}`,
                media: [],
                texts: [],
                avatar: null,
                background: {
                    type: "color",
                    color: "#FFFFFF"
                },
                script: "",
                aspectRatio: aspectRatio,
            };
            
            if (!projectId) {
                toast.error("项目ID不存在，无法创建场景");
                return;
            }
            
            // 调用创建场景API
            const createdScene = await createScene(projectId, newSceneData);
            
            // 更新本地状态
            const newScenes = [...scenes, createdScene];
            updateHistory(newScenes);
            setActiveScene(scenes.length);
        } catch (error) {
            console.error("创建场景失败:", error);
            toast.error("创建场景失败，请重试");
        }
    }, [scenes, updateHistory, aspectRatio, projectId]);

    // 更新 useEffect 来初始化 projectData
    useEffect(() => {
        if (project) {
            // 使用 project 数据初始化 projectData
            setProjectData({
                ...project,
                // 确保日期字段是 Date 对象
                createdAt: project.createdAt instanceof Date ? project.createdAt : new Date(project.createdAt),
                updatedAt: project.updatedAt instanceof Date ? project.updatedAt : new Date(project.updatedAt)
            });
        }
    }, [project]);

    // 处理场景标题更新
    const handleSceneTitleUpdate = useCallback(async (index: number, newTitle: string) => {
        try {
            // 调用后端接口更新场景标题
            await updateSceneTitle(scenes[index].id, newTitle);

            // 更新本地状态
            const newScenes = [...scenes];
            newScenes[index].title = newTitle;
            updateHistory(newScenes);
        } catch (error) {
            console.error("更新场景标题失败:", error);
            toast.error("更新场景标题失败，请重试");
        }
    }, [scenes, updateHistory]);
    // 新增删除场景的处理函数
    const handleDeleteScene = async () => {
        if (!scenes[activeScene]) return;

        try {
            // 调用删除场景的API
            await deleteScene(scenes[activeScene].id);

            // 更新本地状态
            const newScenes = [...scenes];
            newScenes.splice(activeScene, 1);

            // 如果删除的是最后一个场景，则将活动场景索引减1
            if (activeScene >= newScenes.length) {
                setActiveScene(Math.max(0, newScenes.length - 1));
            }
            // 更新历史记录 - 修复类型错误
            updateHistory(newScenes);

        } catch (error) {
            console.error("删除场景失败:", error);
            toast.error("删除场景失败");
        }
    };
    
// Handle copying a scene
const handleCopyScene = useCallback(async () => {
    if (!scenes[activeScene]) return;
    
    try {
        // 调用复制场景API，后端会自动处理位置信息
        const createdScene = await duplicateScene(scenes[activeScene].id);
        
        // 在本地场景数组中插入新复制的场景，位置是当前场景的后面
        const targetPosition = activeScene + 1;
        const newScenes = [...scenes];
        newScenes.splice(targetPosition, 0, createdScene);
        
        // 更新历史记录
        updateHistory(newScenes);
        
        // 将活动场景设置为新复制的场景
        setActiveScene(targetPosition);
        
    } catch (error) {
        console.error("复制场景失败:", error);
        toast.error("复制场景失败，请重试");
    }
}, [scenes, activeScene, updateHistory]);

    // 使用hook中的方法处理添加形状

    return (
        <div className="flex flex-col h-screen bg-white">
            {isLoading ? (
                // 加载中的界面
                <div>
                </div>
            ) : (
                <>
                    {/* Top Navigation */}
                    <VideoHeader
                        projectId={projectId}
                        videoTitle={videoTitle}
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
                        selectedElementType={selectedElement?.type}
                        onClearSelection={() => setSelectedElement(null)}
                        onSelectShapeType={handleAddShapeElement}
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
                                            background={scenes[activeScene].background || {
                                                type: "color",
                                                color: "#FFFFFF"
                                            }}
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
                                            {scenes[activeScene].texts?.map((text, index) => (
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
                                            {scenes[activeScene].media?.map((mediaItem) => {
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

                                            {/* 渲染形状元素 */}
                                            {scenes[activeScene].shapes?.map((shape, index) => (
                                                <ElementContextMenu
                                                    key={`shape-${index}`}
                                                    onBringToFront={handleBringToFront}
                                                    onSendToBack={handleSendToBack}
                                                    onBringForward={handleBringForward}
                                                    onSendBackward={handleSendBackward}
                                                    disabled={!(selectedElement?.type === "shape" && selectedElement.index === index)}
                                                >
                                                    <ResizableShape
                                                        {...shape}
                                                        onResize={(newSize) => {
                                                            handleShapeUpdate(newSize);
                                                        }}
                                                        onSelect={() => handleElementSelect({ type: "shape", index })}
                                                        isSelected={selectedElement?.type === "shape" && selectedElement.index === index}
                                                        canvasWidth={currentCanvasDimensions.width}
                                                        canvasHeight={currentCanvasDimensions.height}
                                                        containerWidth={previewDimensions.width}
                                                        containerHeight={previewDimensions.height}
                                                        otherElements={getAllElementsForAlignment(scenes[activeScene], undefined, "shape", index)}
                                                    />
                                                </ElementContextMenu>
                                            ))}

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
                                    aspectRatio={currentAspectRatio} // 传递当前的宽高比例
                                    updateSceneTitle={handleSceneTitleUpdate}
                                    onDeleteScene={handleDeleteScene}
                                    onCopyScene={handleCopyScene}
                                />
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </>
            )}
        </div>
    );
}

