"use client"

import { Button } from "@/components/ui/button"
import { VideoRecorder } from "@/components/video/video-recorder.tsx"
import { ScriptReader } from "@/components/editor/script-reader.tsx"
import { useVoiceCloning } from '@/hooks/VoiceCloningContext';

export default function RecordingScreen({ onBack }: { onBack: () => void }) {
    const { voiceName, gender, audioUrl, language, avatarUrl, discardData, submitData } = useVoiceCloning();
    const isFormComplete = voiceName && gender && audioUrl && language && avatarUrl;
    const discardVoideCloing = () => {
        discardData()
        //跳转到 home页面
        window.location.href = "/home";
    }
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-white shadow-sm">
                <h1 className="text-xl font-medium text-gray-800">创建您的虚拟形象</h1>
                <Button onClick={discardVoideCloing} variant="outline" className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50">
                    回到主页
                </Button>
            </div>

            {/* Main Content - Left-Right Layout */}
            <div className="flex-grow flex flex-col md:flex-row">
                {/* Left Column - Video Recording Area */}
                <div className="w-full md:w-1/2 border-r border-gray-200">
                    <VideoRecorder />
                </div>

                {/* Right Column - Script */}
                <div className="w-full md:w-1/2">
                    <ScriptReader />
                </div>
            </div>

            {/* Footer */}
            <div className="flex p-6 bg-white border-t border-gray-200 gap-4">
                <Button variant="outline" className="rounded-full border-gray-300 text-gray-700" onClick={onBack}>
                    返回
                </Button>
                {isFormComplete && (
                    <Button onClick={submitData} className="rounded-full border-gray-300 ">
                        完成
                    </Button>
                )}
            </div>
        </div>
    )
}

