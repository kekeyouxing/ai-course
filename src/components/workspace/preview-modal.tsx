"use client"

import { useEffect, useRef, useState, useMemo } from "react"
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
import { AnimationMarker } from "@/types/animation"
import { getSceneAnimationMarkers } from "@/api/animation"

// 修改组件接口，添加场景数据
interface PreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentScene?: Scene;
    scenes?: Scene[];
    activeSceneIndex?: number;
}

// 验证场景是否可预览
const isScenePlayable = (scene?: Scene) => {
    if (!scene) return false;
    return Boolean(scene.script || scene.duration || scene.audioSrc);
};

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
  // 添加动画标记状态
  const [animationMarkers, setAnimationMarkers] = useState<AnimationMarker[]>([])
  const [loadingMarkers, setLoadingMarkers] = useState(false)
  // 添加一个useRef来存储每秒计算一次的可见性结果
  const visibilityCache = useRef<Record<string, boolean>>({});
  // 存储当前整数秒的ref，用于检测是否需要清除缓存
  const lastSecondRef = useRef<number>(-1);

  // 创建一个函数用于获取动画标记
  const fetchAnimationMarkers = async (scene?: Scene) => {
    if (!scene || !scene.id) return;
    
    setLoadingMarkers(true);
    try {
      const result = await getSceneAnimationMarkers(scene.id);
      console.log("API 返回结果:", result);
      if (result.code === 0 && result.data?.markers) {
        console.log("成功获取动画标记:", result.data.markers.length, "个标记");
        setAnimationMarkers(result.data.markers);
      } else {
        console.error("获取标记失败, API返回:", result);
        setAnimationMarkers([]);
      }
    } catch (error) {
      console.error("获取动画标记失败:", error);
      setAnimationMarkers([]);
    } finally {
      setLoadingMarkers(false);
    }
  };
    // 处理模态框关闭，清空渲染内容
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // 清空渲染内容
            setCurrentTime(0);
            setIsPlaying(false);
            setError(null);
            setAnimationMarkers([]); // 清空动画标记

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
            setCurrentTime(0);
            setIsPlaying(false);
            setError(null);
            
            // 查找首个可播放的场景
            if (!isScenePlayable(scenes[activeSceneIndex])) {
                const playableIndex = scenes.findIndex(isScenePlayable);
                if (playableIndex >= 0) {
                    setCurrentSceneIndex(playableIndex);
                } else {
                    // 如果没有可播放的场景，显示错误
                    setError("所有场景都缺少必要内容(脚本/时长/音频)，无法预览");
                }
            } else {
                setCurrentSceneIndex(activeSceneIndex);
            }
        }
    }, [open, activeSceneIndex, scenes]);

    // 当场景改变时，获取该场景的动画标记
    useEffect(() => {
        if (!open) return;
        
        const currentScene = scenes[currentSceneIndex];
        if (currentScene && isScenePlayable(currentScene)) {
            fetchAnimationMarkers(currentScene);
        } else {
            // 如果当前场景不可播放，清空动画标记
            setAnimationMarkers([]);
        }
    }, [currentSceneIndex, open, scenes]);

    // 处理音频同步
    useEffect(() => {
        const scene = scenes[currentSceneIndex];
        const audio = audioRef.current;

        if (!audio || !scene?.audioSrc) return;

        // 优化音频同步逻辑
        if (isPlaying) {
            // 只在时间差异明显时才同步，减少频繁调整
            const timeDiff = Math.abs(audio.currentTime - currentTime);
            if (timeDiff > 0.3) {
                audio.currentTime = currentTime;
            }
            
            // 使用Promise处理播放，避免重复调用播放方法
            if (audio.paused) {
                setIsLoading(true); // 播放前设置加载状态
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsLoading(false); // 播放成功，取消加载状态
                        })
                        .catch(err => {
                            console.error("音频播放失败:", err);
                            setError("音频播放失败，但预览将继续");
                            setIsLoading(false); // 播放失败，取消加载状态
                            // 3秒后自动清除错误提示
                            setTimeout(() => setError(null), 3000);
                            
                            // 尝试恢复播放
                            if (err.name === "NotAllowedError") {
                                // 用户交互问题，继续模拟播放但不实际播放音频
                                audio.muted = true;
                            } else if (err.name === "AbortError") {
                                // 播放被中断，可能是由于资源问题
                                setTimeout(() => {
                                    if (isPlaying && audio.paused) {
                                        audio.play().catch(() => {
                                            // 忽略连续错误
                                        });
                                    }
                                }, 1000);
                            }
                        });
                }
            }
        } else {
            audio.pause();
        }
    }, [isPlaying, currentTime, currentSceneIndex, scenes]);

    // 添加音频缓冲状态监听
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const handleWaiting = () => {
            setIsLoading(true);
        };
        
        const handleCanPlay = () => {
            setIsLoading(false);
        };
        
        const handleError = (e: Event) => {
            console.error("音频加载错误:", e);
            setError("音频加载失败，请检查网络连接");
            setIsLoading(false);
            
            // 5秒后自动清除错误提示
            setTimeout(() => setError(null), 5000);
        };
        
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        
        return () => {
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
        };
    }, []);

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

        // 使用requestAnimationFrame代替setInterval，提高性能
        let lastTimestamp = performance.now();
        let animationFrameId: number;
        let accumulatedDelta = 0; // 累积时间差，用于平滑更新

        const updatePlayback = (timestamp: number) => {
            // 计算时间差（秒）
            const deltaTime = (timestamp - lastTimestamp) / 1000;
            lastTimestamp = timestamp;
            
            // 累积时间差，当达到一定阈值时才更新UI，减少状态更新频率
            accumulatedDelta += deltaTime;
            
            // 只有当累积的时间差超过一定阈值(16.7ms ≈ 60fps)或接近结束时才更新UI
            if (accumulatedDelta >= 0.0167 || currentTime + accumulatedDelta >= duration) {
                setCurrentTime(prev => {
                    const newTime = prev + accumulatedDelta;
                    // 重置累积器
                    accumulatedDelta = 0;
                    
                    if (newTime >= duration) {
                        // 播放结束
                        setIsPlaying(false);
                        return duration;
                    }
                    return newTime;
                });
            }

            // 继续动画循环，只有在仍然播放时
            if (isPlaying) {
                animationFrameId = requestAnimationFrame(updatePlayback);
            }
        };

        // 启动动画循环
        animationFrameId = requestAnimationFrame(updatePlayback);

        // 清理函数
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying, duration]);
    
    // 添加一个调试函数来显示当前动画标记状态
    useEffect(() => {
        if (isPlaying && animationMarkers.length > 0) {
            // 转换为毫秒以便于比较
            const currentTimeMs = currentTime * 1000;
            
            // 根据当前时间查找正在触发的动画标记
            const activeMarkers = animationMarkers.filter(marker => 
                marker.timestamp !== undefined && 
                Math.abs(marker.timestamp - currentTimeMs) < 100 // 100ms容差内的标记视为活跃
            );
            
            // 如果有标记被触发，打印出来以便调试
            if (activeMarkers.length > 0) {
                console.log('触发动画标记:', activeMarkers);
            }
        }
    }, [currentTime, isPlaying, animationMarkers]);

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
            // 查找前一个可播放的场景
            for (let i = currentSceneIndex - 1; i >= 0; i--) {
                if (isScenePlayable(scenes[i])) {
                    // 先清除当前场景的元素，避免过渡动画
                    setCurrentSceneIndex(i);
                    // 使用setTimeout确保DOM更新
                    setTimeout(() => {
                        setCurrentTime(0);
                    }, 0);
                    return;
                }
            }
            // 如果找不到可播放的前一个场景，显示提示
            setError("前面没有可预览的场景");
            setTimeout(() => setError(null), 3000);
        }
    }

    // 切换到下一个场景
    const handleNextScene = () => {
        if (currentSceneIndex < scenes.length - 1) {
            // 查找下一个可播放的场景
            for (let i = currentSceneIndex + 1; i < scenes.length; i++) {
                if (isScenePlayable(scenes[i])) {
                    // 先清除当前场景的元素，避免过渡动画
                    setCurrentSceneIndex(i);
                    // 使用setTimeout确保DOM更新
                    setTimeout(() => {
                        setCurrentTime(0);
                    }, 0);
                    return;
                }
            }
            // 如果找不到可播放的下一个场景，显示提示
            setError("后面没有可预览的场景");
            setTimeout(() => setError(null), 3000);
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
    
    // 检查当前场景是否可播放
    const currentScenePlayable = isScenePlayable(scene);
    
    useEffect(() => {
        // 如果当前场景不可播放，显示提示
        if (open && scene && !currentScenePlayable) {
            setError("当前场景缺少必要内容(脚本/时长/语音)，无法预览");
            // 不自动清除这个错误
        } else if (error === "当前场景缺少必要内容(脚本/时长/音频)，无法预览" || error === "当前场景缺少必要内容(脚本/时长/语音)，无法预览") {
            // 如果场景变为可播放，清除错误
            setError(null);
        }
    }, [open, scene, currentScenePlayable]);

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
        // 更新场景时设置时长
    useEffect(() => {
        if (!open) return;
        
        const scene = scenes[currentSceneIndex] || currentScene;
        if (!scene) return;
        
        // 如果场景有自定义时长，使用该时长
        if (scene.duration) {
            // 将毫秒转换为秒
            setDuration(scene.duration / 1000);
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

    // 修改isElementVisible函数，使用缓存减少计算频率
    const isElementVisible = (startMarkerId?: string, endMarkerId?: string, animationBehavior?: string) => {
        if (!startMarkerId && !endMarkerId) return true; // 如果没有动画标记，则始终可见
        
        // 获取当前整数秒
        const currentTimeSeconds = Math.floor(currentTime);
        
        // 生成缓存key
        const cacheKey = `${startMarkerId || ''}-${endMarkerId || ''}-${animationBehavior || ''}-${currentTimeSeconds}`;
        
        // 如果当前秒数变化了，清空缓存
        if (lastSecondRef.current !== currentTimeSeconds) {
            lastSecondRef.current = currentTimeSeconds;
            visibilityCache.current = {}; // 清空缓存
            
        }
        
        // 检查缓存中是否有结果
        if (cacheKey in visibilityCache.current) {
            return visibilityCache.current[cacheKey];
        }
        
        // 以下是原来的可见性计算逻辑
        // 查找开始和结束标记
        const startMarker = startMarkerId ? animationMarkers.find(marker => marker.id === startMarkerId) : null;
        const endMarker = endMarkerId ? animationMarkers.find(marker => marker.id === endMarkerId) : null;
        
        // 检查元素是否应该可见（采用秒级别比较，忽略毫秒）
        let shouldBeVisible = false;
        
        if (startMarker && startMarker.timestamp !== undefined) {
            // 将毫秒转为秒并向下取整
            const markerTimeSeconds = Math.floor(startMarker.timestamp / 1000);
            
            // 简化的比较: 只要当前播放秒数 >= 动画标记秒数，就显示元素
            shouldBeVisible = currentTimeSeconds >= markerTimeSeconds;
            
        }
        
        // 如果有结束标记，检查是否应该隐藏
        if (endMarker && endMarker.timestamp !== undefined) {
            const endTimeSeconds = Math.floor(endMarker.timestamp / 1000);
            // 如果当前时间超过结束时间，应该隐藏
            if (currentTimeSeconds >= endTimeSeconds) {
                shouldBeVisible = false;
            }
        }
        
        // 将结果存入缓存
        visibilityCache.current[cacheKey] = shouldBeVisible;
        
        return shouldBeVisible;
    };

    // 用useMemo优化视频播放时的重复渲染
    const currentTimeInteger = useMemo(() => Math.floor(currentTime), [currentTime]);
    
    
    // 生成CSS动画样式
    const getAnimationStyle = (element: any) => {
        if (!element.animationType || element.animationType === "none") {
            return {};
        }
        
        // 检查元素是否有开始标记
        const startMarker = element.startAnimationMarkerId 
            ? animationMarkers.find(marker => marker.id === element.startAnimationMarkerId)
            : null;
            
        // 检查元素是否有结束标记
        const endMarker = element.endAnimationMarkerId
            ? animationMarkers.find(marker => marker.id === element.endAnimationMarkerId)
            : null;
        
        // 计算当前时间（毫秒）
        const currentTimeMs = currentTime * 1000;
        
        // 初始化样式变量
        let transform = 'none';
        let opacity = 1;
        let transition = `all 1s linear`; // 匀速过渡，持续1秒
        
        // 检查当前是否处于动画中
        let isAnimating = false;
        let isEntering = false;
        let isExiting = false;
        
        // 根据动画行为(enter/exit/both)判断当前应该显示什么动画
        if (element.animationBehavior === "enter" || element.animationBehavior === "both") {
            if (startMarker && startMarker.timestamp !== undefined) {
                // 判断是否在进入动画时间范围内
                const enterEndTime = startMarker.timestamp + 1000; // 1秒动画时间
                isEntering = currentTimeMs >= startMarker.timestamp && currentTimeMs <= enterEndTime;
                isAnimating = isAnimating || isEntering;
            }
        }
        
        if (element.animationBehavior === "exit" || element.animationBehavior === "both") {
            if (endMarker && endMarker.timestamp !== undefined) {
                // 判断是否在退出动画时间范围内
                const exitStartTime = endMarker.timestamp - 1000; // 提前1秒开始退出动画
                isExiting = currentTimeMs >= exitStartTime && currentTimeMs <= endMarker.timestamp;
                isAnimating = isAnimating || isExiting;
            }
        } else {
            // 如果没有指定动画行为，只处理进入动画
            if (startMarker && startMarker.timestamp !== undefined) {
                const enterEndTime = startMarker.timestamp + 1000;
                isEntering = currentTimeMs >= startMarker.timestamp && currentTimeMs <= enterEndTime;
                isAnimating = isEntering;
            }
        }
        
        // 根据动画类型和方向生成样式
        if (isEntering) {
            // 进入动画 - 如果正在动画过程中
            if (element.animationType === "fade") {
                // 计算当前进度
                const progress = (currentTimeMs - (startMarker?.timestamp || 0)) / 1000;
                opacity = Math.min(1, progress); // 从0到1逐渐变不透明
            } else if (element.animationType === "slide") {
                // 计算当前位置进度
                const progress = (currentTimeMs - (startMarker?.timestamp || 0)) / 1000;
                
                // 根据方向计算当前位置
                switch (element.animationDirection) {
                    case "right":
                        // 从左到右，初始位置为-50px
                        transform = `translateX(${-50 * (1 - progress)}px)`;
                        break;
                    case "left":
                        // 从右到左，初始位置为50px
                        transform = `translateX(${50 * (1 - progress)}px)`;
                        break;
                    case "down":
                        // 从上到下，初始位置为-50px
                        transform = `translateY(${-50 * (1 - progress)}px)`;
                        break;
                    case "up":
                        // 从下到上，初始位置为50px
                        transform = `translateY(${50 * (1 - progress)}px)`;
                        break;
                    default:
                        transform = `translateX(${-50 * (1 - progress)}px)`;
                }
                
                // 透明度随着位置变化
                opacity = Math.min(1, progress);
            }
        } else if (isExiting) {
            // 退出动画 - 如果正在动画过程中
            if (element.animationType === "fade") {
                // 计算退出进度
                const progress = (currentTimeMs - ((endMarker?.timestamp || 0) - 1000)) / 1000;
                opacity = 1 - progress; // 从1到0逐渐变透明
            } else if (element.animationType === "slide") {
                // 计算当前退出位置进度
                const progress = (currentTimeMs - ((endMarker?.timestamp || 0) - 1000)) / 1000;
                
                // 根据方向计算当前退出位置
                switch (element.animationDirection) {
                    case "right":
                        // 向右退出，从0到50px
                        transform = `translateX(${50 * progress}px)`;
                        break;
                    case "left":
                        // 向左退出，从0到-50px
                        transform = `translateX(${-50 * progress}px)`;
                        break;
                    case "up":
                        // 向上退出，从0到-50px
                        transform = `translateY(${-50 * progress}px)`;
                        break;
                    case "down":
                        // 向下退出，从0到50px
                        transform = `translateY(${50 * progress}px)`;
                        break;
                    default:
                        transform = `translateX(${50 * progress}px)`;
                }
                
                // 透明度随着位置变化
                opacity = 1 - progress;
            }
        } else {
            // 不在动画过程中
            if (startMarker && startMarker.timestamp !== undefined && currentTimeMs < startMarker.timestamp) {
                // 在进入时间之前
                if (element.animationType === "fade") {
                    opacity = 0;
                } else if (element.animationType === "slide") {
                    // 根据方向设置初始位置
                    switch (element.animationDirection) {
                        case "right":
                            transform = 'translateX(-50px)';
                            break;
                        case "left":
                            transform = 'translateX(50px)';
                            break;
                        case "up":
                            transform = 'translateY(50px)';
                            break;
                        case "down":
                            transform = 'translateY(-50px)';
                            break;
                        default:
                            transform = 'translateX(-50px)';
                    }
                    opacity = 0; // 确保元素在开始前不可见
                }
            } else if (endMarker && endMarker.timestamp !== undefined && currentTimeMs > endMarker.timestamp) {
                // 在退出时间之后
                if (element.animationBehavior === "exit" || element.animationBehavior === "both") {
                    opacity = 0; // 退出后应该不可见
                    
                    if (element.animationType === "slide") {
                        // 根据方向设置最终位置
                        switch (element.animationDirection) {
                            case "right":
                                transform = 'translateX(50px)';
                                break;
                            case "left":
                                transform = 'translateX(-50px)';
                                break;
                            case "up":
                                transform = 'translateY(-50px)';
                                break;
                            case "down":
                                transform = 'translateY(50px)';
                                break;
                            default:
                                transform = 'translateX(50px)';
                        }
                    }
                }
            }
        }
        
        // 禁用React优化过渡，确保每一帧都重新计算位置
        transition = isAnimating ? 'none' : transition;
        
        return {
            transform,
            opacity,
            transition
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
                        {/* 场景为空或不可播放时的提示 */}
                        {(!scene || !currentScenePlayable) && (
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                <div className="bg-black/50 p-4 rounded text-center max-w-md">
                                    <p className="text-lg font-semibold mb-2">无法预览</p>
                                    <p className="text-sm opacity-80">
                                        {!scene 
                                            ? "未找到场景" 
                                            : "当前场景缺少必要内容(脚本/时长/语音)"}
                                    </p>
                                    <p className="text-xs mt-3 opacity-70">
                                        请在右侧选择其他场景，或返回编辑器添加内容
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* 只有当场景存在且可播放时才渲染内容 */}
                        {scene && currentScenePlayable && (
                            <>
                                {/* 根据场景的宽高比例设置容器 */}
                                {/* 预览模式水印 */}
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

                                        {/* 渲染场景中的文本元素 */}
                                        {scene?.texts?.map((textElement, index) => {
                                            const { x, y, width, height } = calculateScaledPosition(
                                                textElement.x,
                                                textElement.y,
                                                textElement.width,
                                                textElement.height
                                            );
                                            
                                            // 检查文本元素是否应该可见（基于动画标记）
                                            const isVisible = isElementVisible(
                                                textElement.startAnimationMarkerId,
                                                textElement.endAnimationMarkerId,
                                                textElement.animationBehavior
                                            );
                                            
                                            // 如果不可见则跳过渲染
                                            if (!isVisible && isPlaying) {
                                                return null;
                                            }
                                            
                                            // 获取动画样式
                                            const animationStyle = isPlaying 
                                                ? getAnimationStyle(textElement) 
                                                : {};

                                            return (
                                                <div
                                                    key={`text-${index}-${currentTimeInteger}`}
                                                    className="absolute"
                                                    style={{
                                                        left: `${x}px`,
                                                        top: `${y}px`,
                                                        width: `${width}px`,
                                                        height: `${height}px`,
                                                        zIndex: textElement.zIndex || 10,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: `${calculateScaledFontSize(textElement.fontSize || 16)}px`,
                                                            color: textElement.fontColor || '#FFFFFF',
                                                            fontWeight: textElement.bold ? 'bold' : 'normal',
                                                            fontStyle: textElement.italic ? 'italic' : 'normal',
                                                            backgroundColor: textElement.backgroundColor || 'transparent',
                                                            fontFamily: textElement.fontFamily || 'inherit',
                                                            textAlign: (textElement.alignment as any) || 'center',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: textElement.alignment === 'left' ? 'flex-start' : textElement.alignment === 'right' ? 'flex-end' : 'center',
                                                            justifyContent: 'center',
                                                            height: '100%',
                                                            width: '100%',
                                                            padding: '4px',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                            overflow: 'visible',
                                                            opacity: animationStyle.opacity,
                                                            transform: animationStyle.transform ? `${animationStyle.transform} rotate(${textElement.rotation || 0}deg)` : `rotate(${textElement.rotation || 0}deg)`,
                                                            transition: animationStyle.transition
                                                        }}
                                                    >
                                                        {textElement.content}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* 渲染图片媒体元素 */}
                                        {scene?.media?.map((media, index) => {
                                            if ((media as ImageMedia).type === "image") {
                                                const imageMedia = media as ImageMedia;
                                                const { x, y, width, height } = calculateScaledPosition(
                                                    imageMedia.element.x,
                                                    imageMedia.element.y,
                                                    imageMedia.element.width,
                                                    imageMedia.element.height
                                                );
                                                
                                                // 检查图片元素是否应该可见（基于动画标记）
                                                const isVisible = isElementVisible(
                                                    imageMedia.element.startAnimationMarkerId,
                                                    imageMedia.element.endAnimationMarkerId,
                                                    imageMedia.element.animationBehavior
                                                );
                                            
                                                
                                                // 如果不可见则跳过渲染
                                                if (!isVisible && isPlaying) {
                                                    return null;
                                                }
                                                
                                                // 获取动画样式
                                                const animationStyle = isPlaying 
                                                    ? getAnimationStyle(imageMedia.element) 
                                                    : {};

                                                return (
                                                    <div
                                                        key={`image-${index}-${currentTimeInteger}`}
                                                        className="absolute"
                                                        style={{
                                                            left: `${x}px`,
                                                            top: `${y}px`,
                                                            width: `${width}px`,
                                                            height: `${height}px`,
                                                            zIndex: imageMedia.element.zIndex || 5,
                                                        }}
                                                    >
                                                        <img
                                                            src={imageMedia.element.src}
                                                            className="w-full h-full object-contain"
                                                            alt=""
                                                            style={{
                                                                opacity: animationStyle.opacity,
                                                                transform: animationStyle.transform ? `${animationStyle.transform} rotate(${imageMedia.element.rotation || 0}deg)` : `rotate(${imageMedia.element.rotation || 0}deg)`,
                                                                transition: animationStyle.transition
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            }

                                            // 渲染视频媒体元素
                                            if ((media as VideoMedia).type === "video") {
                                                const videoMedia = media as VideoMedia;
                                                const { x, y, width, height } = calculateScaledPosition(
                                                    videoMedia.element.x,
                                                    videoMedia.element.y,
                                                    videoMedia.element.width,
                                                    videoMedia.element.height
                                                );
                                                
                                                // 检查视频元素是否应该可见（基于动画标记）
                                                const isVisible = isElementVisible(
                                                    videoMedia.element.startAnimationMarkerId,
                                                    videoMedia.element.endAnimationMarkerId,
                                                    videoMedia.element.animationBehavior
                                                );
                                                
                                                // 如果不可见则跳过渲染
                                                if (!isVisible && isPlaying) {
                                                    return null;
                                                }
                                                
                                                // 获取动画样式
                                                const animationStyle = isPlaying 
                                                    ? getAnimationStyle(videoMedia.element) 
                                                    : {};

                                                return (
                                                    <div
                                                        key={`video-${index}-${currentTimeInteger}`}
                                                        className="absolute"
                                                        style={{
                                                            left: `${x}px`,
                                                            top: `${y}px`,
                                                            width: `${width}px`,
                                                            height: `${height}px`,
                                                            zIndex: videoMedia.element.zIndex || 5,
                                                        }}
                                                    >
                                                        <video
                                                            src={videoMedia.element.src}
                                                            className="w-full h-full object-contain"
                                                            autoPlay={isPlaying}
                                                            loop
                                                            muted={isMuted}
                                                            style={{
                                                                opacity: animationStyle.opacity,
                                                                transform: animationStyle.transform ? `${animationStyle.transform} rotate(${videoMedia.element.rotation || 0}deg)` : `rotate(${videoMedia.element.rotation || 0}deg)`,
                                                                transition: animationStyle.transition
                                                            }}
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
                                                className="absolute z-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '56px',
                                                    height: '56px',
                                                    padding: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {isLoading ? (
                                                    <div className="h-7 w-7 animate-spin rounded-full border-4 border-white border-t-transparent" />
                                                ) : (
                                                    <Play className="h-7 w-7 text-white fill-white" />
                                                )}
                                            </Button>
                                        )}

                                        {/* 错误提示 */}
                                        {error && (
                                            <Alert variant="destructive" className="absolute bottom-20 left-4 right-4 z-30">
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}
                                        
                                        {/* 加载状态指示 */}
                                        {isLoading && isPlaying && (
                                            <div className="absolute top-4 right-4 z-30">
                                                <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    加载中...
                                                </div>
                                            </div>
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
                                                        {isLoading ? (
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        ) : isPlaying ? (
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
                            </>
                        )}
                    </div>

                    {/* 右侧 - 场景列表 */}
                    <div className="w-64 bg-gray-50 border-l overflow-y-auto">
                        <div className="p-4">
                            <h3 className="font-medium text-lg mb-4">场景列表</h3>

                            <div className="space-y-2">
                                {scenes.map((scene, index) => {
                                    // 判断场景是否可用于预览
                                    const isPlayable = scene.script && scene.duration && scene.audioSrc;
                                    const tooltipText = !isPlayable 
                                        ? `此场景缺少必要内容: ${!scene.script ? '缺少脚本' : ''}${!scene.script && !scene.audioSrc ? '、' : ''}${!scene.audioSrc ? '缺少AI生成声音' : ''}${(!scene.script || !scene.audioSrc) && !scene.duration ? '、' : ''}${!scene.duration ? '缺少时长' : ''}`
                                        : "";
                                    
                                    // 生成不可预览的具体原因
                                    let previewStatus = "";
                                    if (!isPlayable) {
                                        if (!scene.script) previewStatus = "缺少脚本";
                                        else if (!scene.audioSrc) previewStatus = "缺少语音";
                                        else if (!scene.duration) previewStatus = "缺少时长";
                                    }
                                    
                                    return (
                                        <div
                                            key={index}
                                            className={`p-2 rounded transition-colors relative ${
                                                currentSceneIndex === index
                                                    ? "bg-blue-100 text-blue-700"
                                                    : isPlayable
                                                    ? "hover:bg-gray-100 cursor-pointer"
                                                    : "bg-gray-50 text-gray-400 cursor-not-allowed"
                                            }`}
                                            onClick={() => {
                                                if (!isPlayable) return;
                                                
                                                // 先清除当前场景的元素，避免过渡动画
                                                setCurrentSceneIndex(index);
                                                // 使用setTimeout确保DOM更新
                                                setTimeout(() => {
                                                    setCurrentTime(0);
                                                    // 获取该场景的动画标记
                                                    if (isPlayable && scene) {
                                                        fetchAnimationMarkers(scene);
                                                    }
                                                }, 0);
                                            }}
                                            title={tooltipText}
                                        >
                                            <div className="font-medium flex items-center">
                                                <span>场景 {index + 1}</span>
                                                {!isPlayable && (
                                                    <span className="ml-1 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                                                        {previewStatus}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {scene.script 
                                                    ? scene.script.substring(0, 50) + "..." 
                                                    : <span className="italic">无脚本</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );


}
