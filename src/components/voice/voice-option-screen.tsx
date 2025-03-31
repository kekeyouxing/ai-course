"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CloudIcon as CloudMusic, Mic, InfoIcon } from "lucide-react"
import UploadScreen from "@/components/media/upload-screen"
import RecordingSetup from "@/components/recording/recording-setup"
import { useVoiceCloning } from '@/hooks/VoiceCloningContext';
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VoiceOptionScreen({ onBack }: { onBack: () => void }) {
    const [selectedOption, setSelectedOption] = useState<"record" | "upload">("upload")
    const [showUpload, setShowUpload] = useState(false)
    const [showRecording, setShowRecording] = useState(false)
    const { discardData, isEditMode, submitData } = useVoiceCloning();

    if (showUpload && !isEditMode) {
        return <UploadScreen onBack={() => setShowUpload(false)} />
    }

    if (showRecording && !isEditMode) {
        return <RecordingSetup onBack={() => setShowRecording(false)} />
    }

    const discardVoideCloing = () => {
        discardData()
        //跳转到 home页面
        window.location.href = "/home";
    }

    const handleSubmit = () => {
        submitData();
        window.location.href = "/videolab";
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex justify-between items-center p-6">
                <h1 className="text-xl font-medium text-gray-800">
                    {isEditMode ? "编辑您的虚拟形象" : "创建您的虚拟形象"}
                </h1>
                <Button variant="outline" className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50"
                    onClick={discardVoideCloing} >
                    回到主页
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex justify-center items-center px-4">
                <div className="bg-white rounded-lg shadow-sm w-full max-w-3xl p-8">
                    <div className="space-y-6">
                        {isEditMode && (
                            <Alert className="bg-blue-50 border-blue-200">
                                <InfoIcon className="h-4 w-4 text-blue-500" />
                                <AlertDescription className="text-blue-700">
                                    编辑模式下不能修改语音文件，如需更换语音请创建新的虚拟形象。
                                </AlertDescription>
                            </Alert>
                        )}

                        <h2 className="text-xl font-medium text-gray-800">
                            {isEditMode ? "语音文件（不可修改）" : "选择一个选项"}
                        </h2>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isEditMode ? "opacity-60 pointer-events-none" : ""}`}>
                            {/* Record option */}
                            <div
                                className={`p-6 bg-gray-50 rounded-lg cursor-pointer ${selectedOption === "record" ? "border-2 border-blue-500" : "border border-gray-200"
                                    }`}
                                onClick={() => !isEditMode && setSelectedOption("record")}
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 flex items-center justify-center">
                                        <Mic className="w-16 h-16 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800">录制您的声音</h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            朗读文本来克隆您的声音
                                            <br />需要高质量的麦克风和良好的录音环境
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Upload option */}
                            <div
                                className={`p-6 bg-gray-50 rounded-lg cursor-pointer ${selectedOption === "upload" ? "border-2 border-blue-500" : "border border-gray-200"
                                    }`}
                                onClick={() => !isEditMode && setSelectedOption("upload")}
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 flex items-center justify-center">
                                        <CloudMusic className="w-16 h-16 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800">上传语音文件</h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            上传您的高质量
                                            <br />
                                            音频文件
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" className="rounded-full border-gray-300 text-gray-700"
                                onClick={onBack}>
                                返回
                            </Button>

                            {isEditMode ? (
                                <Button
                                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                    onClick={handleSubmit}
                                >
                                    完成
                                </Button>
                            ) : (
                                <Button
                                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                    onClick={() => {
                                        if (selectedOption === "upload") {
                                            setShowUpload(true)
                                        } else if (selectedOption === "record") {
                                            setShowRecording(true)
                                        }
                                    }}
                                >
                                    下一步
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

