"use client"

import { useState, useEffect } from "react"
import {
    Check,
    Eye,
    Redo,
    Undo,
    Zap,
    Square,
    Play,
    Loader2,
    Clock,
    Text,
    FileText,
    RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AspectRatioType, Scene } from "@/types/scene"
import PreviewModal from "./preview-modal"
import ValidationModal from "./validation-modal"
import { checkVideoGeneration, generateVideo } from "@/api/generater"
import { useUserInfo } from "@/hooks/use-user-info"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import SubscriptionModal from "@/components/subscription/subscription-modal"
import VideoPackModal from "@/components/videopack/videopack-modal"
import { toast } from "sonner";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface VideoHeaderProps {
    videoTitle: string
    projectId?: string
    handleUndo: () => void
    handleRedo: () => void
    historyIndex: number
    historyLength: number
    currentScene?: Scene
    scenes?: Scene[]
    activeSceneIndex?: number
    aspectRatio?: AspectRatioType
    onAspectRatioChange?: (ratio: AspectRatioType) => void
}

export function VideoHeader({
    videoTitle,
    projectId,
    handleUndo,
    handleRedo,
    historyIndex,
    historyLength,
    currentScene,
    scenes = [],
    activeSceneIndex = 0,
    aspectRatio = "16:9",
    onAspectRatioChange = () => {}
}: VideoHeaderProps) {
    const [previewOpen, setPreviewOpen] = useState<boolean>(false)
    const [aspectRatioOpen, setAspectRatioOpen] = useState<boolean>(false)
    const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)
    const [videoPackModalOpen, setVideoPackModalOpen] = useState(false)
    
    const [validationOpen, setValidationOpen] = useState(false)
    const [errorMessages, setErrorMessages] = useState<string[]>([])
    const [hasErrors, setHasErrors] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const { fetchUserInfo, getResourceInfo } = useUserInfo()
    const resourceInfo = getResourceInfo()

    const aspectRatioOptions: AspectRatioType[] = ["16:9", "9:16", "1:1", "4:3"];

    const formatVideoTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    
    const formatChars = (chars: number) => {
        if (chars >= 10000) {
            return `${(chars / 10000).toFixed(1)}万字`
        }
        return `${chars}字`
    }

    useEffect(() => {
        fetchUserInfo()
    }, [fetchUserInfo])

    const handleCheckGeneration = async () => {
        if (!projectId) {
            toast.error("项目ID不存在，无法生成视频");
            return;
        }
        
        setIsChecking(true);
        try {
            const result = await checkVideoGeneration(projectId);
            setErrorMessages(result.errors);
            setHasErrors(result.hasErrors);
            setValidationOpen(true);
        } catch (error) {
            console.error("Error checking video generation:", error);
            toast.error("无法连接到服务器，请稍后再试");
        } finally {
            setIsChecking(false);
        }
    };

    const handleGenerate = async () => {
        if (!projectId) {
            toast.error("项目ID不存在，无法生成视频");
            return;
        }
        
        setIsGenerating(true);
        try {
            const success = await generateVideo(projectId);
            if (success) {
                toast.success("视频正在生成中，请稍后查看");
                setValidationOpen(false);
            } else {
                toast.error("无法生成视频，请稍后再试");
            }
        } catch (error) {
            console.error("Error generating video:", error);
            toast.error("服务器错误，请稍后再试");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportScript = async () => {
        if (!scenes || scenes.length === 0) {
            toast.error("没有可导出的脚本内容");
            return;
        }

        setIsExporting(true);
        try {
            const paragraphs = scenes
                .filter(scene => scene.script)
                .map((scene, index) => {
                    const cleanScript = scene.script!
                        .replace(/<#\d+#>/g, '')
                        .replace(/<@animation(?::[a-zA-Z0-9-]+)?@>/g, '');
                    
                    return [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${scene.title || '未命名场景'}`,
                                    bold: true,
                                    size: 28
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: cleanScript,
                                    size: 24
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: "" })]
                        })
                    ];
                })
                .flat();
            
            if (paragraphs.length === 0) {
                toast.error("没有可导出的脚本内容");
                return;
            }
            
            const doc = new Document({
                sections: [{
                    children: paragraphs
                }]
            });
            
            const buffer = await Packer.toBlob(doc);
            saveAs(buffer, `${videoTitle || "脚本"}.docx`);
            
            toast.success("脚本导出成功");
        } catch (error) {
            console.error("导出脚本失败:", error);
            toast.error("导出脚本失败，请重试");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <header className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <div 
                            className="w-8 h-8 rounded-full bg-black flex items-center justify-center cursor-pointer"
                            onClick={() => window.location.href = "/app/home"}
                            title="返回主页"
                        >
                            <div className="w-6 h-6 rounded-full border-2 border-white"></div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleUndo}
                            disabled={historyIndex === 0}
                        >
                            <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRedo}
                            disabled={historyIndex === historyLength - 1}
                        >
                            <Redo className="h-4 w-4" />
                        </Button>
                        <div className="h-4 border-r border-gray-300 mx-1"></div>

                        <Popover open={aspectRatioOpen} onOpenChange={setAspectRatioOpen}>
                            <PopoverTrigger>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-xs flex items-center gap-1"
                                >
                                    <Square className="h-3.5 w-3.5" />
                                    {aspectRatio}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {aspectRatioOptions.map((ratio) => (
                                        <Button
                                            key={ratio}
                                            variant={aspectRatio === ratio ? "default" : "outline"}
                                            size="sm"
                                            className="w-full justify-center"
                                            onClick={() => {
                                                onAspectRatioChange(ratio);
                                                setAspectRatioOpen(false);
                                            }}
                                        >
                                            {ratio}
                                        </Button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="h-4 border-r border-gray-300 mx-1"></div>
                        
                        <Popover onOpenChange={(open) => {
                            if (open) {
                                fetchUserInfo();
                            }
                        }}>
                            <PopoverTrigger>
                                <Button
                                    variant="outline"
                                    className="h-8 px-3 text-sm bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1"
                                >
                                    <Zap className="h-3.5 w-3.5" />
                                    我的余额
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-3">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium">余额信息</h4>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 px-2 text-xs" 
                                            onClick={() => fetchUserInfo()}
                                        >
                                            <RefreshCw className="h-3 w-3 mr-1" />
                                            刷新
                                        </Button>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium flex items-center text-amber-700 mb-1.5">
                                            <Clock className="h-4 w-4 mr-1.5" />
                                            视频额度
                                        </p>
                                        <div className="bg-amber-50 p-2 rounded-md w-full text-xs">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-500">会员额度:</span>
                                                <span className="text-amber-700 font-medium">{formatVideoTime(resourceInfo.memberVideoSeconds)}</span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-500">套餐额度:</span>
                                                <span className="text-amber-700 font-medium">{formatVideoTime(resourceInfo.packageVideoSeconds)}</span>
                                            </div>
                                            <div className="flex justify-between pt-1 border-t border-amber-200">
                                                <span className="text-gray-500 font-medium">总计:</span>
                                                <span className="text-amber-800 font-medium">{formatVideoTime(resourceInfo.totalVideoSeconds)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-medium flex items-center text-green-700 mb-1.5">
                                            <Text className="h-4 w-4 mr-1.5" />
                                            脚本额度
                                        </p>
                                        <div className="bg-green-50 p-2 rounded-md w-full text-xs">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-500">会员额度:</span>
                                                <span className="text-green-700 font-medium">{formatChars(resourceInfo.memberTextChars)}</span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-500">套餐额度:</span>
                                                <span className="text-green-700 font-medium">{formatChars(resourceInfo.packageTextChars)}</span>
                                            </div>
                                            <div className="flex justify-between pt-1 border-t border-green-200">
                                                <span className="text-gray-500 font-medium">总计:</span>
                                                <span className="text-green-800 font-medium">{formatChars(resourceInfo.totalTextChars)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        
                        <div className="h-4 border-r border-gray-300 mx-1"></div>
                        <Button
                            variant="outline"
                            className="h-8 px-3 text-sm bg-blue-50 text-blue-500 border-blue-100 flex items-center gap-1"
                            onClick={() => setSubscriptionModalOpen(true)}
                        >
                            订阅
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <Zap className="h-3 w-3 text-white" />
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 px-3 text-sm bg-yellow-50 text-yellow-500 border-yellow-100 flex items-center gap-1"
                            onClick={() => setVideoPackModalOpen(true)}
                        >
                            充值
                            <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                                <Zap className="h-3 w-3 text-white" />
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        className="h-8 px-3 text-sm bg-indigo-50 text-indigo-500 border-indigo-100 flex items-center gap-1"
                        onClick={handleExportScript}
                        disabled={isExporting || !scenes || scenes.length === 0}
                    >
                        {isExporting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                            <FileText className="h-3.5 w-3.5 mr-1" />
                        )}
                        导出脚本
                    </Button>
                    
                    <Button
                        variant="outline"
                        className="h-8 px-3 text-sm flex items-center gap-1"
                        onClick={() => setPreviewOpen(true)}
                    >
                        <Eye className="h-3.5 w-3.5" />
                        预览
                    </Button>
                    
                    <Button
                        onClick={handleCheckGeneration}
                        disabled={isChecking || !projectId}
                        className="h-8"
                    >
                        {isChecking ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                检查中...
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5 mr-1" />
                                生成视频
                            </>
                        )}
                    </Button>
                </div>
            </header>

            <PreviewModal
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                currentScene={currentScene}
                scenes={scenes}
                activeSceneIndex={activeSceneIndex}
            />
            
            <ValidationModal
                open={validationOpen}
                onOpenChange={setValidationOpen}
                errorMessages={errorMessages}
                hasErrors={hasErrors}
                onConfirm={handleGenerate}
            />
            
            <SubscriptionModal 
                open={subscriptionModalOpen}
                onOpenChange={setSubscriptionModalOpen}
            />
            
            <VideoPackModal 
                open={videoPackModalOpen}
                onOpenChange={setVideoPackModalOpen}
            />
        </>
    )
}