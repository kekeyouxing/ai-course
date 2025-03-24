"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize2,
    SkipBack,
    SkipForward,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Scene, ImageMedia, VideoMedia, AspectRatioType } from "@/types/scene"
import { Alert, AlertDescription } from "@/components/ui/alert"

// 修改组件接口，添加场景数据
interface PreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentScene?: Scene;
    scenes?: Scene[];
    activeSceneIndex?: number;
}

export default function PreviewModal({
    open,
    onOpenChange,
    currentScene,
    scenes = [],
    activeSceneIndex = 0
}: PreviewModalProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [volume, setVolume] = useState(50)
    const [isMuted, setIsMuted] = useState(false)
    const [duration, setDuration] = useState(60) // 默认60秒，但会被场景的duration覆盖
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [currentSceneIndex, setCurrentSceneIndex] = useState(activeSceneIndex)
    const [sceneDataLoaded, setSceneDataLoaded] = useState(false);
    // 引用
    const videoContainerRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    // 添加一个状态来跟踪容器是否已经准备好
    const [containerReady, setContainerReady] = useState(false);

    // 处理模态框关闭，清空渲染内容
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // 清空渲染内容
            setCurrentTime(0);
            setIsPlaying(false);
            setError(null);

            // 如果有音频正在播放，停止它
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            // 如果处于全屏状态，退出全屏
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => {
                    console.error("退出全屏失败:", err);
                });
            }
        }

        // 调用原始的 onOpenChange
        onOpenChange(open);
    };

    // 重置预览状态
    useEffect(() => {
        if (open) {
            setCurrentTime(0)
            setIsPlaying(false)
            setCurrentSceneIndex(activeSceneIndex)
            setError(null)
        }
    }, [open, activeSceneIndex])

    // 处理音频同步
    useEffect(() => {
        const scene = scenes[currentSceneIndex];
        const audio = audioRef.current;

        if (!audio || !scene?.audioSrc) return;

        if (isPlaying) {
            audio.currentTime = currentTime;
            audio.play().catch(err => {
                console.error("音频播放失败:", err);
                setError("音频播放失败，但预览将继续");
            });
        } else {
            audio.pause();
        }
    }, [isPlaying, currentTime, currentSceneIndex, scenes]);

    // 更新音量
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
            audioRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);
    // 合并多个 useEffect，简化逻辑
    useEffect(() => {
        if (!open) {
            setContainerReady(false);
            setSceneDataLoaded(false);
            return;
        }

        // 重置状态
        setCurrentTime(0);
        setIsPlaying(false);
        setCurrentSceneIndex(activeSceneIndex);
        setError(null);

        // 使用 ResizeObserver 监听容器尺寸变化
        const resizeObserver = new ResizeObserver(() => {
            const containerEl = videoContainerRef.current?.querySelector('.absolute.inset-0');
            if (containerEl && containerEl.clientWidth > 0 && containerEl.clientHeight > 0) {
                setContainerReady(true);

                // 延迟一帧设置场景数据加载完成，确保DOM已更新
                requestAnimationFrame(() => {
                    setSceneDataLoaded(true);
                    // 强制重新渲染
                    setCurrentTime(0.01);
                    setTimeout(() => setCurrentTime(0), 50);
                });
            }
        });

        if (videoContainerRef.current) {
            resizeObserver.observe(videoContainerRef.current);
        }

        // 如果 ResizeObserver 没有立即触发，使用定时器作为备选方案
        const timer = setTimeout(() => {
            if (!containerReady) {
                setContainerReady(true);
                setSceneDataLoaded(true);
                // 强制重新渲染
                setCurrentTime(0.01);
            }
        }, 300);

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timer);
        };
    }, [open, activeSceneIndex, currentScene, scenes]);
    // 模拟播放进度
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentTime(prev => {
                if (prev >= duration) {
                    setIsPlaying(false);
                    return duration;
                }
                return prev + 0.1;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, duration]);

    // 播放/暂停控制
    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    }

    // 处理进度条变化
    const handleProgressChange = (value: number[]) => {
        const newTime = (value[0] / 100) * duration;
        setCurrentTime(newTime);

        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    }

    // 处理音量变化
    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }

    // 切换静音
    const toggleMute = () => {
        setIsMuted(!isMuted);
    }

    // 切换全屏
    const toggleFullscreen = () => {
        if (!videoContainerRef.current) return;

        if (!document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen().catch((err) => {
                console.error(`全屏模式错误: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // 切换到上一个场景
    const handlePrevScene = () => {
        if (currentSceneIndex > 0) {
            // 先清除当前场景的元素，避免过渡动画
            setCurrentSceneIndex(prev => {
                // 使用setTimeout确保DOM更新
                setTimeout(() => {
                    setCurrentTime(0);
                }, 0);
                return prev - 1;
            });
        }
    }

    // 切换到下一个场景
    const handleNextScene = () => {
        if (currentSceneIndex < scenes.length - 1) {
            // 先清除当前场景的元素，避免过渡动画
            setCurrentSceneIndex(prev => {
                // 使用setTimeout确保DOM更新
                setTimeout(() => {
                    setCurrentTime(0);
                }, 0);
                return prev + 1;
            });
        }
    }

    // 格式化时间显示
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 修改计算缩放后的位置和尺寸函数
    const calculateScaledPosition = (x: number, y: number, width: number, height: number) => {
        // 获取预览容器的实际尺寸
        const containerEl = videoContainerRef.current?.querySelector('.absolute.inset-0');
        const containerWidth = containerEl?.clientWidth || 0;
        const containerHeight = containerEl?.clientHeight || 0;

        // 如果容器尺寸为0，使用默认比例
        if (containerWidth <= 0 || containerHeight <= 0) {
            // 使用一个默认的缩放比例，或者直接返回原始值
            const defaultScale = 0.5; // 假设默认缩放为0.5
            return {
                x: x * defaultScale,
                y: y * defaultScale,
                width: width * defaultScale,
                height: height * defaultScale
            };
        }

        // 根据场景的宽高比例获取原始画布尺寸
        let originalWidth = 1920;
        let originalHeight = 1080;

        if (scene?.aspectRatio) {
            switch (scene.aspectRatio) {
                case "9:16":
                    originalWidth = 1080;
                    originalHeight = 1920;
                    break;
                case "1:1":
                    originalWidth = 1080;
                    originalHeight = 1080;
                    break;
                case "4:3":
                    originalWidth = 1440;
                    originalHeight = 1080;
                    break;
                // 16:9 是默认值，不需要修改
            }
        }

        // 计算缩放比例 - 使用统一的缩放比例以保持宽高比
        const scale = Math.min(containerWidth / originalWidth, containerHeight / originalHeight);

        // 计算缩放后的内容实际尺寸
        const scaledContentWidth = originalWidth * scale;
        const scaledContentHeight = originalHeight * scale;

        // 计算内容在容器中的偏移量（居中显示）
        const offsetX = (containerWidth - scaledContentWidth) / 2;
        const offsetY = (containerHeight - scaledContentHeight) / 2;

        console.log("容器尺寸:", containerWidth, containerHeight);
        // 返回缩放后的位置和尺寸，考虑偏移量
        return {
            x: x * scale + offsetX,
            y: y * scale + offsetY,
            width: width * scale,
            height: height * scale
        };
    }

    // 同样修改字体大小计算函数
    const calculateScaledFontSize = (fontSize: number) => {
        const containerEl = videoContainerRef.current?.querySelector('.absolute.inset-0');
        const containerWidth = containerEl?.clientWidth || 0;
        const containerHeight = containerEl?.clientHeight || 0;

        // 根据场景的宽高比例获取原始画布尺寸
        let originalWidth = 1920;
        let originalHeight = 1080;

        if (scene?.aspectRatio) {
            switch (scene.aspectRatio) {
                case "9:16":
                    originalWidth = 1080;
                    originalHeight = 1920;
                    break;
                case "1:1":
                    originalWidth = 1080;
                    originalHeight = 1080;
                    break;
                case "4:3":
                    originalWidth = 1440;
                    originalHeight = 1080;
                    break;
                // 16:9 是默认值，不需要修改
            }
        }

        // 使用统一的缩放比例
        const scale = Math.min(containerWidth / originalWidth, containerHeight / originalHeight);
        return fontSize * scale;
    }

    // 获取当前场景
    const scene = scenes[currentSceneIndex] || currentScene;

    const getContainerStyle = (aspectRatio: AspectRatioType = "16:9") => {
        // 根据不同的宽高比返回不同的样式
        const aspectRatioValue = aspectRatio === "9:16" ? "9/16" :
            aspectRatio === "16:9" ? "16/9" :
                aspectRatio === "1:1" ? "1/1" : "4/3";

        // 判断是宽度大还是高度大
        const isWidthGreater = aspectRatio === "16:9"
        const isHeightGreater = aspectRatio === "9:16" || aspectRatio === "1:1" || aspectRatio === "4:3"; // 将1:1也视为高度优先

        // 根据宽高比特性返回不同的样式
        return {
            ...(isWidthGreater ? { width: "100%" } : { height: "100%" }),
            aspectRatio: aspectRatioValue,
            maxHeight: "100%",
            maxWidth: "100%",
            margin: "0 auto"
        };
    };
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="p-0 border-none shadow-xl"
                style={{
                    backgroundColor: "transparent",
                    width: "85%",
                    maxWidth: "1300px",
                    height: "85vh",
                    maxHeight: "700px",
                }}
            >
                <div className="flex h-full overflow-hidden rounded-lg bg-white">
                    {/* 左侧 - 预览区域 */}
                    <div ref={videoContainerRef} className="relative flex-1 bg-gray-900 flex items-center justify-center">

                        {/* 根据场景的宽高比例设置容器 */}                        {/* 预览模式水印 */}
                        <div className="absolute bottom-20 right-6 z-30 opacity-70 pointer-events-none">
                            <div className="bg-black/40 text-white text-xs px-2 py-1 rounded">
                                预览模式 · 无嘴唇和表情同步
                            </div>
                        </div>
                        <div
                            className="relative overflow-hidden"
                            style={getContainerStyle(scene?.aspectRatio)}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* 内容保持不变 */}
                                {!isPlaying && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />}

                                {/* 场景背景 */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center z-0"
                                    style={{
                                        backgroundColor: scene?.background?.type === "color"
                                            ? scene.background.color
                                            : "#000000",
                                        backgroundImage: scene?.background?.type === "image"
                                            ? `url(${scene.background.src})`
                                            : "none",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center"
                                    }}
                                />

                                {/* 场景视频背景 */}
                                {scene?.background?.type === "video" && (
                                    <video
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ zIndex: 1 }}
                                        src={scene.background.src}
                                        autoPlay={isPlaying}
                                        loop
                                        muted={isMuted}
                                    />
                                )}

                                {/* 渲染文本元素 */}
                                {scene?.texts && scene.texts.map((text, index) => {
                                    const { x, y, width, height } = calculateScaledPosition(
                                        text.x,
                                        text.y,
                                        text.width,
                                        text.height
                                    );

                                    return (
                                        <div
                                            key={`text-${index}`}
                                            className="absolute"
                                            style={{
                                                left: `${x}px`,
                                                top: `${y}px`,
                                                width: `${width}px`,
                                                height: `${height}px`,
                                                zIndex: text.zIndex || 10,
                                                fontFamily: text.fontFamily || "sans-serif",
                                                fontSize: `${calculateScaledFontSize(text.fontSize)}px`,
                                                fontWeight: text.bold ? 'bold' : 'normal',
                                                fontStyle: text.italic ? 'italic' : 'normal',
                                                color: text.fontColor || "#000000",
                                                backgroundColor: text.backgroundColor || "transparent",
                                                textAlign: text.alignment || "left",
                                                transform: `rotate(${text.rotation || 0}deg)`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: text.alignment === "center" ? "center" :
                                                    text.alignment === "right" ? "flex-end" : "flex-start",
                                                transition: "none",
                                                overflow: "visible", // 确保文本不会被裁剪
                                                whiteSpace: "pre-wrap", // 保留文本格式
                                                wordBreak: "break-word" // 确保长文本能够换行
                                            }}
                                        >
                                            {text.content}
                                        </div>
                                    );
                                })}

                                {/* 渲染媒体元素 */}
                                {scene?.media && scene.media.map((mediaItem, index) => {
                                    if (mediaItem.type === "image") {
                                        const imageMedia = mediaItem as ImageMedia;
                                        const { x, y, width, height } = calculateScaledPosition(
                                            imageMedia.element.x,
                                            imageMedia.element.y,
                                            imageMedia.element.width,
                                            imageMedia.element.height
                                        );

                                        return (
                                            <div
                                                key={`image-${index}`}
                                                className="absolute"
                                                style={{
                                                    left: `${x}px`,
                                                    top: `${y}px`,
                                                    width: `${width}px`,
                                                    height: `${height}px`,
                                                    zIndex: imageMedia.element.zIndex || 5,
                                                    transform: `rotate(${imageMedia.element.rotation || 0}deg)`,
                                                }}
                                            >
                                                <img
                                                    src={imageMedia.element.src}
                                                    alt="Media"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        );
                                    } else if (mediaItem.type === "video") {
                                        const videoMedia = mediaItem as VideoMedia;
                                        const { x, y, width, height } = calculateScaledPosition(
                                            videoMedia.element.x,
                                            videoMedia.element.y,
                                            videoMedia.element.width,
                                            videoMedia.element.height
                                        );

                                        return (
                                            <div
                                                key={`video-${index}`}
                                                className="absolute"
                                                style={{
                                                    left: `${x}px`,
                                                    top: `${y}px`,
                                                    width: `${width}px`,
                                                    height: `${height}px`,
                                                    zIndex: videoMedia.element.zIndex || 5,
                                                    transform: `rotate(${videoMedia.element.rotation || 0}deg)`,
                                                }}
                                            >
                                                <video
                                                    src={videoMedia.element.src}
                                                    className="w-full h-full object-contain"
                                                    autoPlay={isPlaying}
                                                    loop
                                                    muted={isMuted}
                                                />
                                            </div>
                                        );
                                    }
                                    return null;
                                })}

                                {/* 渲染头像元素 */}
                                {scene?.avatar && (
                                    (() => {
                                        const { x, y, width, height } = calculateScaledPosition(
                                            scene.avatar.x,
                                            scene.avatar.y,
                                            scene.avatar.width,
                                            scene.avatar.height
                                        );

                                        return (
                                            <div
                                                className="absolute"
                                                style={{
                                                    left: `${x}px`,
                                                    top: `${y}px`,
                                                    width: `${width}px`,
                                                    height: `${height}px`,
                                                    zIndex: scene.avatar.zIndex || 10,
                                                    transform: `rotate(${scene.avatar.rotation || 0}deg)`,
                                                }}
                                            >
                                                <img
                                                    src={scene.avatar.src}
                                                    alt="Avatar"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        );
                                    })()
                                )}

                                {/* 播放按钮 */}
                                {!isPlaying && (
                                    <Button
                                        onClick={togglePlay}
                                        className="absolute z-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-6"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    >
                                        <Play className="h-8 w-8 text-white fill-white" />
                                    </Button>
                                )}

                                {/* 错误提示 */}
                                {error && (
                                    <Alert variant="destructive" className="absolute bottom-20 left-4 right-4 z-30">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>

                        {/* 音频元素 */}
                        {scene?.audioSrc && (
                            <audio
                                ref={audioRef}
                                src={scene.audioSrc}
                                preload="metadata"
                            />
                        )}

                        {/* 视频控制 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-20">
                            <div className="space-y-2">
                                <Slider
                                    value={[Math.round((currentTime / duration) * 100)]}
                                    onValueChange={handleProgressChange}
                                    className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                                />

                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm font-medium">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handlePrevScene}
                                                disabled={currentSceneIndex === 0}
                                                className="text-white hover:bg-white/10 h-8 w-8"
                                            >
                                                <SkipBack className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={togglePlay}
                                                className="text-white hover:bg-white/10 h-8 w-8"
                                            >
                                                {isPlaying ? (
                                                    <Pause className="h-4 w-4" />
                                                ) : (
                                                    <Play className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleNextScene}
                                                disabled={currentSceneIndex === scenes.length - 1}
                                                className="text-white hover:bg-white/10 h-8 w-8"
                                            >
                                                <SkipForward className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={toggleMute}
                                                className="text-white hover:bg-white/10 h-8 w-8"
                                            >
                                                {isMuted ? (
                                                    <VolumeX className="h-4 w-4" />
                                                ) : (
                                                    <Volume2 className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <div className="w-24">
                                                <Slider
                                                    value={[volume]}
                                                    onValueChange={handleVolumeChange}
                                                    className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={toggleFullscreen}
                                            className="text-white hover:bg-white/10 h-8 w-8"
                                        >
                                            <Maximize2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右侧 - 场景列表 */}
                    <div className="w-64 bg-gray-50 border-l overflow-y-auto">
                        <div className="p-4">
                            <h3 className="font-medium text-lg mb-4">场景列表</h3>

                            <div className="space-y-2">
                                {scenes.map((scene, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded cursor-pointer transition-colors ${currentSceneIndex === index
                                            ? "bg-blue-100 text-blue-700"
                                            : "hover:bg-gray-100"
                                            }`}
                                        onClick={() => {
                                            // 先清除当前场景的元素，避免过渡动画
                                            setCurrentSceneIndex(index);
                                            // 使用setTimeout确保DOM更新
                                            setTimeout(() => {
                                                setCurrentTime(0);
                                            }, 0);
                                        }}
                                    >
                                        <div className="font-medium">场景 {index + 1}</div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {scene.script ? scene.script.substring(0, 50) + "..." : "无脚本"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    // 更新场景时设置时长
    useEffect(() => {
        if (!open) return;
        
        const scene = scenes[currentSceneIndex] || currentScene;
        if (!scene) return;
        
        // 如果场景有自定义时长，使用该时长
        if (scene.duration) {
            setDuration(scene.duration);
        } else if (scene.audioSrc && audioRef.current) {
            // 如果场景有音频，尝试使用音频时长
            const handleLoadedMetadata = () => {
                if (audioRef.current && audioRef.current.duration) {
                    setDuration(audioRef.current.duration);
                }
            };
            
            audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
            
            // 如果音频已经加载完成，直接设置时长
            if (audioRef.current.readyState >= 2 && audioRef.current.duration) {
                setDuration(audioRef.current.duration);
            }
            
            return () => {
                if (audioRef.current) {
                    audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
                }
            };
        } else {
            // 否则使用默认时长
            setDuration(60);
        }
    }, [open, currentSceneIndex, scenes, currentScene]);
}
