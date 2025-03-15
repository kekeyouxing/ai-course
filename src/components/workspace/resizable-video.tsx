"use client"
import { useCallback, useRef, useState, useEffect } from "react"
import { Rnd } from "react-rnd"
import { DraggableData, DraggableEvent } from "react-draggable"

interface ResizableVideoProps {
    src: string
    width: number
    height: number
    x: number
    y: number
    rotation: number
    volume?: number // 音量，0-1之间
    autoPlay?: boolean
    loop?: boolean
    muted?: boolean
    onResize: (newSize: Partial<ResizableVideoProps>) => void
    onSelect: () => void
    isSelected: boolean
}

export function ResizableVideo({
    src,
    width,
    height,
    x,
    y,
    rotation,
    volume = 1,
    autoPlay = true,
    loop = true,
    muted = false,
    onResize,
    onSelect,
    isSelected,
}: ResizableVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [aspectRatio, setAspectRatio] = useState(16/9) // 默认视频比例

    // 加载视频后获取实际宽高比
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleLoadedMetadata = () => {
            if (video.videoWidth && video.videoHeight) {
                setAspectRatio(video.videoWidth / video.videoHeight)
            }
        }

        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        
        // 如果视频已经加载完成，直接设置宽高比
        if (video.readyState >= 2) {
            handleLoadedMetadata()
        }

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        }
    }, [src])

    // 设置音量
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume || 0
            videoRef.current.muted = muted
        }
    }, [volume, muted])

    // 处理播放/暂停
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.play().catch(err => {
                console.error("视频播放失败:", err)
                setIsPlaying(false)
            })
        } else {
            video.pause()
        }
    }, [isPlaying])

    // 处理自动播放
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (autoPlay) {
            video.play().catch(err => {
                console.error("自动播放失败:", err)
            })
        }
    }, [autoPlay])

    const handleResizeStop = useCallback(
        (
            e: MouseEvent | TouchEvent,
            direction: string,
            ref: HTMLElement,
            delta: { width: number; height: number },
            position: { x: number; y: number },
        ) => {
            // 获取新的宽度
            const newWidth = Number.parseInt(ref.style.width)
            // 根据宽高比计算新的高度
            const newHeight = direction.includes('y') 
                ? Number.parseInt(ref.style.height) 
                : newWidth / aspectRatio

            onResize({
                width: newWidth,
                height: newHeight,
                x: position.x,
                y: position.y,
            })
        },
        [onResize, aspectRatio],
    )

    const handleDragStop = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            onResize({ x: data.x, y: data.y })
        },
        [onResize],
    )

    const togglePlay = useCallback(() => {
        setIsPlaying(prev => !prev)
    }, [])

    return (
        <Rnd
            size={{ width, height }}
            position={{ x, y }}
            onResizeStop={handleResizeStop}
            onDragStop={handleDragStop}
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onSelect()
            }}
            style={{
                transform: `rotate(${rotation}deg)`,
                zIndex: isSelected ? 10 : 1,
            }}
            lockAspectRatio={aspectRatio}
            resizeHandleStyles={{
                bottomRight: {
                    display: isSelected ? "block" : "none",
                    width: "10px",
                    height: "10px",
                    background: "#1a73e8",
                    borderRadius: "50%",
                    bottom: "-5px",
                    right: "-5px",
                },
            }}
            resizeHandleComponent={{
                bottomRight: isSelected ? (
                    <div className="w-3 h-3 bg-blue-500 rounded-full absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 cursor-se-resize" />
                ) : undefined,
            }}
        >
            <div className="relative w-full h-full group">
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full object-contain"
                    loop={loop}
                    muted={muted}
                    onClick={(e) => {
                        e.stopPropagation()
                        onSelect()
                        // 如果已选中，则切换播放状态
                        if (isSelected) {
                            togglePlay()
                        }
                    }}
                />
                
                {/* 视频控制层 - 仅在选中时显示 */}
                {isSelected && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                            onClick={togglePlay}
                            className="bg-white/80 rounded-full p-2 hover:bg-white"
                        >
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="6" y="4" width="4" height="16"></rect>
                                    <rect x="14" y="4" width="4" height="16"></rect>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            )}
                        </button>
                    </div>
                )}

                {/* 选中边框 */}
                {isSelected && (
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
                )}
            </div>
        </Rnd>
    )
}