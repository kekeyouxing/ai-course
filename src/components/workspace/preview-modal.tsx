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
    Download
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Scene, TextElement, ImageMedia, VideoMedia } from "@/types/scene"
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
    const [duration, setDuration] = useState(60) // 默认60秒
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [currentSceneIndex, setCurrentSceneIndex] = useState(activeSceneIndex)
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
    
    // 引用
    const videoContainerRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    
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
            setCurrentSceneIndex(currentSceneIndex - 1);
            setCurrentTime(0);
        }
    }
    
    // 切换到下一个场景
    const handleNextScene = () => {
        if (currentSceneIndex < scenes.length - 1) {
            setCurrentSceneIndex(currentSceneIndex + 1);
            setCurrentTime(0);
        }
    }
    
    // 生成视频
    const handleGenerateVideo = async () => {
        try {
            setIsGeneratingVideo(true);
            setError(null);
            
            // 这里应该调用后端API来生成视频
            // 示例代码:
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scenes: scenes,
                }),
            });
            
            if (!response.ok) {
                throw new Error('视频生成失败');
            }
            
            const data = await response.json();
            
            // 提供下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = data.videoUrl;
            downloadLink.download = 'generated-video.mp4';
            downloadLink.click();
            
            setIsGeneratingVideo(false);
        } catch (err) {
            console.error('视频生成错误:', err);
            setError('视频生成失败，请稍后再试');
            setIsGeneratingVideo(false);
        }
    }
    
    // 格式化时间显示
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 获取当前场景
    const scene = scenes[currentSceneIndex] || currentScene;
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <div ref={videoContainerRef} className="relative flex-1 bg-gray-900">
                        {/* 添加16:9宽高比容器 */}
                        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                            <div className="absolute inset-0 flex items-center justify-center">
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
                                {scene?.texts && scene.texts.map((text, index) => (
                                    <div
                                        key={`text-${index}`}
                                        className="absolute transition-all"
                                        style={{
                                            left: `${text.x}px`,
                                            top: `${text.y}px`,
                                            width: `${text.width}px`,
                                            height: `${text.height}px`,
                                            zIndex: text.zIndex || 10,
                                            fontFamily: text.fontFamily || "sans-serif",
                                            fontSize: `${text.fontSize}px`,
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
                                        }}
                                    >
                                        {text.content}
                                    </div>
                                ))}
                                
                                {/* 渲染媒体元素 */}
                                {scene?.media && scene.media.map((mediaItem, index) => {
                                    if (mediaItem.type === "image") {
                                        const imageMedia = mediaItem as ImageMedia;
                                        return (
                                            <div
                                                key={`image-${index}`}
                                                className="absolute"
                                                style={{
                                                    left: `${imageMedia.element.x}px`,
                                                    top: `${imageMedia.element.y}px`,
                                                    width: `${imageMedia.element.width}px`,
                                                    height: `${imageMedia.element.height}px`,
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
                                        return (
                                            <div
                                                key={`video-${index}`}
                                                className="absolute"
                                                style={{
                                                    left: `${videoMedia.element.x}px`,
                                                    top: `${videoMedia.element.y}px`,
                                                    width: `${videoMedia.element.width}px`,
                                                    height: `${videoMedia.element.height}px`,
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
                                    <div
                                        className="absolute"
                                        style={{
                                            left: `${scene.avatar.x}px`,
                                            top: `${scene.avatar.y}px`,
                                            width: `${scene.avatar.width}px`,
                                            height: `${scene.avatar.height}px`,
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
                                )}

                                {/* 播放按钮 */}
                                {!isPlaying && (
                                    <Button
                                        onClick={togglePlay}
                                        className="absolute z-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-6"
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
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleGenerateVideo}
                                            disabled={isGeneratingVideo}
                                            className="text-white bg-white/10 hover:bg-white/20 border-white/20"
                                        >
                                            {isGeneratingVideo ? (
                                                <span className="flex items-center">
                                                    <span className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    生成中...
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <Download className="h-4 w-4 mr-1" />
                                                    生成视频
                                                </span>
                                            )}
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
                                        className={`p-2 rounded cursor-pointer transition-colors ${
                                            currentSceneIndex === index
                                                ? "bg-blue-100 text-blue-700"
                                                : "hover:bg-gray-100"
                                        }`}
                                        onClick={() => {
                                            setCurrentSceneIndex(index);
                                            setCurrentTime(0);
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
}