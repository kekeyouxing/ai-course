"use client"
import { useCallback, useRef, useState, useEffect } from "react"
import { Rnd } from "react-rnd"
import { DraggableData, DraggableEvent } from "react-draggable"
import { checkForSnapping, ElementPosition, AlignmentGuide } from "@/utils/alignment-utils"
import { AlignmentGuides } from "./alignment-guides"

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
    canvasWidth?: number
    canvasHeight?: number
    containerWidth?: number
    containerHeight?: number
    otherElements?: ElementPosition[] // 添加其他元素用于对齐
    zIndex?: number // 添加 zIndex 属性
    displayMode: "freeze" | "hide" | "loop"; // 显示模式
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
    canvasWidth = 1920,
    canvasHeight = 1080,
    containerWidth,
    containerHeight,
    otherElements = [],
    zIndex = 1,
    displayMode = "freeze", // 添加默认值
}: ResizableVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [aspectRatio, setAspectRatio] = useState(16/9) // 默认视频比例
    const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [videoEnded, setVideoEnded] = useState(false) // 添加视频结束状态
    
    // 计算实际显示尺寸与标准尺寸的比例
    const scaleX = (containerWidth || canvasWidth) / canvasWidth
    const scaleY = (containerHeight || canvasHeight) / canvasHeight
    const scale = Math.min(scaleX, scaleY)
    
    // 将标准坐标和尺寸转换为实际显示尺寸
    const displayX = x * scaleX
    const displayY = y * scaleY
    const displayWidth = width * scaleX
    const displayHeight = height * scaleY

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

    // 处理视频结束事件和displayMode
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // 根据displayMode设置loop属性
        video.loop = displayMode === "loop"

        const handleEnded = () => {
            setVideoEnded(true)
            setIsPlaying(false)

            // 根据displayMode处理视频结束后的行为
            if (displayMode === "freeze") {
                // 固定最后一帧 - 不需要额外操作，视频自然停在最后一帧
            } else if (displayMode === "hide") {
                // 视频结束后隐藏 - 在渲染时处理
            } else if (displayMode === "loop") {
                // 循环播放 - 通过video.loop属性已设置
                setIsPlaying(true)
            }
        }

        video.addEventListener('ended', handleEnded)
        
        // 重置状态
        setVideoEnded(false)

        return () => {
            video.removeEventListener('ended', handleEnded)
        }
    }, [displayMode])

    const handleResizeStop = useCallback(
        (
            e: MouseEvent | TouchEvent,
            direction: string,
            ref: HTMLElement,
            delta: { width: number; height: number },
            position: { x: number; y: number },
        ) => {
            // 获取新的宽度并转换回标准尺寸
            const newWidth = Math.round(Number.parseInt(ref.style.width) / scaleX)
            // 根据宽高比计算新的高度
            const newHeight = direction.includes('y') 
                ? Math.round(Number.parseInt(ref.style.height) / scaleY) 
                : Math.round(newWidth / aspectRatio)

            onResize({
                width: newWidth,
                height: newHeight,
                x: Math.round(position.x / scaleX),
                y: Math.round(position.y / scaleY),
            })
            
            // 清除对齐参考线
            setAlignmentGuides([])
        },
        [onResize, aspectRatio, scaleX, scaleY],
    )

    // Handle drag start to set dragging state
    const handleDragStart = useCallback(() => {
        setIsDragging(true)
    }, [])
    
    // Handle drag to check for alignment
    const handleDrag = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            // Current element position (使用整数坐标)
            const currentElement: ElementPosition = {
                x: Math.round(data.x / scaleX), // 转换为标准坐标并取整
                y: Math.round(data.y / scaleY),
                width,
                height
            }
            
            // Check for snapping
            const { x: snappedX, y: snappedY, guides } = checkForSnapping(currentElement, otherElements, scale)
            
            // Update alignment guides
            setAlignmentGuides(guides)
            
            // If snapping occurred, update position
            if (snappedX !== null || snappedY !== null) {
                // The snapped position will be applied by the Rnd component
                // through the position prop in the next render
            }
        },
        [width, height, scale, scaleX, scaleY, otherElements],
    )

    const handleDragStop = useCallback(
        (_: DraggableEvent, data: DraggableData) => {
            // Clear alignment guides
            setAlignmentGuides([])
            setIsDragging(false)
            
            // 将实际显示位置转换回标准位置，并确保为整数
            onResize({ 
                x: Math.round(data.x / scaleX), 
                y: Math.round(data.y / scaleY) 
            })
        },
        [onResize, scaleX, scaleY],
    )

    const togglePlay = useCallback(() => {
        if (videoEnded && displayMode !== "loop") {
            // 如果视频已结束且不是循环模式，则重新开始播放
            if (videoRef.current) {
                videoRef.current.currentTime = 0
            }
            setVideoEnded(false)
        }
        setIsPlaying(prev => !prev)
    }, [videoEnded, displayMode])

    // 如果视频已结束且displayMode为hide，则不显示视频
    if (videoEnded && displayMode === "hide") {
        return null
    }

    return (
        <>
            {/* Alignment guides - only show when dragging */}
            {isDragging && alignmentGuides.length > 0 && (
                <AlignmentGuides guides={alignmentGuides} scale={scale} />
            )}
            
            <Rnd
                size={{ width: displayWidth, height: displayHeight }}
                position={{ x: displayX, y: displayY }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onResizeStop={handleResizeStop}
                onDragStop={handleDragStop}
                onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    onSelect()
                }}
                style={{
                    transform: `rotate(${rotation}deg)`,
                    zIndex: isSelected ? 10 : zIndex,
                }}
                lockAspectRatio={aspectRatio}
            >
            <div className="relative w-full h-full group">
                <video
                    ref={videoRef}
                    src={src}
                    className="w-full h-full object-contain"
                    loop={displayMode === "loop"}
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

                {/* 选中边框和控制点 */}
                {isSelected && (
                    <>
                        <div className="absolute inset-0 outline outline-1 outline-blue-500 pointer-events-none" />
                        <div className="absolute top-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ns-resize">
                            <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="absolute right-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                            <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 translate-y-1/2 cursor-ns-resize">
                            <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="absolute left-0 top-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-ew-resize">
                            <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </>
                )}
            </div>
            </Rnd>
        </>
    )
}