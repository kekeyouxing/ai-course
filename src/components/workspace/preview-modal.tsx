"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Maximize2, Play, Pause, Volume2, VolumeX, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// 修改组件接口，添加控制打开/关闭的属性
interface PreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PreviewModal({ open, onOpenChange }: PreviewModalProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [isVideoReady, setIsVideoReady] = useState(false)
    const [volume, setVolume] = useState(50)
    const [isMuted, setIsMuted] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const videoContainerRef = useRef<HTMLDivElement>(null)
    const [duration, setDuration] = useState(71) // Default duration
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Reset video state when modal opens/closes
    useEffect(() => {
        if (!open) {
            setIsPlaying(false)
            setCurrentTime(0)
            setError(null)
        }
    }, [open])

    // Update video volume when volume state changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume / 100
            videoRef.current.muted = isMuted
        }
    }, [volume, isMuted])

    // Handle fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [])

    const togglePlay = async () => {
        if (!videoRef.current || isLoading || !isVideoReady) return

        try {
            setIsLoading(true)
            setError(null)

            if (isPlaying) {
                videoRef.current.pause()
                setIsPlaying(false)
            } else {
                try {
                    await videoRef.current.play()
                    setIsPlaying(true)
                } catch (err) {
                    if (err instanceof Error) {
                        setError(`Play error: ${err.message}`)
                    } else {
                        setError("Unknown play error occurred")
                    }
                    console.error("Play error:", err)
                    setIsPlaying(false)
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleProgressChange = (value: number[]) => {
        if (videoRef.current && isVideoReady) {
            const newTime = (value[0] / 100) * duration
            videoRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0]
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
    }

    const toggleFullscreen = () => {
        if (!videoContainerRef.current) return

        if (!document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`)
            })
        } else {
            document.exitFullscreen()
        }
    }

    const handleVideoLoaded = () => {
        if (videoRef.current) {
            setIsVideoReady(true)
            setDuration(videoRef.current.duration || 71)
            console.log("Video loaded successfully, duration:", videoRef.current.duration)
        }
    }

    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const videoElement = e.currentTarget

        let errorMessage = "Unknown video error"
        if (videoElement.error) {
            switch (videoElement.error.code) {
                case 1:
                    errorMessage = "Video loading aborted"
                    break
                case 2:
                    errorMessage = "Network error while loading video"
                    break
                case 3:
                    errorMessage = "Video decoding failed"
                    break
                case 4:
                    errorMessage = "Video not supported"
                    break
                default:
                    errorMessage = `Video error: ${videoElement.error.message}`
            }
        }

        console.error(errorMessage, videoElement.error)
        setError(errorMessage)
        setIsPlaying(false)
        setIsLoading(false)
    }

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
                    {/* Left side - Video Player */}
                    <div ref={videoContainerRef} className="relative flex-1 bg-gray-900">
                        <div className="absolute inset-0 flex items-center justify-center">
                            {!isPlaying && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />}

                            {/* Use a div as poster to avoid CORS issues */}
                            {!isVideoReady && (
                                <div
                                    className="absolute inset-0 bg-cover bg-center z-0"
                                    style={{
                                        backgroundImage:
                                            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%AA%E5%B1%8F2025-03-15%2006.34.57-jL4OyLtQObhKonbYaI141gVp9vLSke.png)",
                                    }}
                                />
                            )}

                            <video
                                ref={videoRef}
                                className="h-full w-full object-contain"
                                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onLoadedData={handleVideoLoaded}
                                onError={handleVideoError}
                                preload="metadata"
                                style={{ aspectRatio: "16/9" }}
                            >
                                {/* Use a sample video that's known to work */}
                                <source
                                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                                    type="video/mp4"
                                />
                                <source
                                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>

                            {/* Show error message if there's an error */}
                            {error && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
                                    <div className="bg-red-100 text-red-800 p-4 rounded-md max-w-xs text-center">
                                        <p className="font-bold mb-2">Video Error</p>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}

                            {!isPlaying && !error && (
                                <Button
                                    onClick={togglePlay}
                                    disabled={isLoading || !isVideoReady}
                                    className="absolute z-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm p-6"
                                >
                                    {isLoading ? (
                                        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <Play className="h-8 w-8 text-white fill-white" />
                                    )}
                                </Button>
                            )}
                        </div>

                        {/* Video Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10">
                            <div className="space-y-2">
                                <Slider
                                    value={[Math.round((currentTime / duration) * 100)]}
                                    onValueChange={handleProgressChange}
                                    disabled={!isVideoReady || !!error}
                                    className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                                />

                                <div className="flex items-center gap-4 text-white">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/10"
                                        onClick={togglePlay}
                                        disabled={!isVideoReady || !!error}
                                    >
                                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                    </Button>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-40 p-3" side="top">
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium">Volume</h4>
                                                <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>0%</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <span className="text-sm font-medium">
                                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} /{" "}
                                        {Math.floor(duration / 60)}:{String(Math.floor(duration % 60) % 60).padStart(2, "0")}
                                    </span>

                                    <div className="flex-1" />

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/10"
                                        onClick={toggleFullscreen}
                                    >
                                        <Maximize2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Content */}
                    <div className="w-[400px] p-8 relative overflow-y-auto">
                        <div className="mt-16 space-y-8">
                            <div className="space-y-2">
                                <div className="inline-flex gap-2 text-sm">
                                    <span className="bg-black/10 px-3 py-1 rounded-full font-medium">Draft</span>
                                    <span className="bg-black/10 px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                                        <span className="block h-1.5 w-1.5 rounded-full bg-current" /> 3 scenes
                                    </span>
                                </div>
                                <h1 className="text-4xl font-bold">Create your first AI video</h1>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-medium">Welcome to my wonderful AI video.</h2>
                                <p className="text-lg">Start by editing this scene.</p>
                            </div>

                            <div className="flex gap-4">
                                <Button className="bg-black text-white hover:bg-black/90 rounded-full px-6">Generate video</Button>
                                <Button variant="outline" className="bg-white gap-2 rounded-full border-0">
                                    <Copy className="h-4 w-4" />
                                    Copy draft link
                                </Button>
                            </div>

                            {/* 添加提示信息 */}
                            <Alert className=" bottom-8 bg-blue-50 border-blue-100 flex items-start mt-16 gap-2">
                                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <AlertDescription className="text-blue-700 text-sm">
                                    预览中没有唇部动作和场景转换。
                                    您需要生成视频才能使这些内容可见。
                                </AlertDescription>
                            </Alert>
                        </div>


                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

