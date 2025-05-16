"use client"

import { Button } from "@/components/ui/button"
import { VideoRecorder } from "@/components/clone/video-recorder"
import { ScriptReader } from "@/components/clone/script-reader"
import { useVoiceCloning } from '@/hooks/VoiceCloningContext';
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function RecordingScreen({ onBack }: { onBack: () => void }) {
    const { voiceName, gender, audioUrl, language, avatarUrl, discardData, submitData, voiceId } = useVoiceCloning();
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 使用useEffect监听关键字段变化，更新isFormComplete
    useEffect(() => {
        setIsFormComplete(Boolean(voiceName && gender && audioUrl && language && avatarUrl && voiceId));
    }, [voiceName, gender, audioUrl, language, avatarUrl, voiceId]);

    const discardVoideCloing = () => {
        discardData()
        //跳转到 home页面
        window.location.href = "/app/home";
    }
    
    const handleSubmit = async () => {
        if (!isFormComplete) return;
        
        try {
            setIsSubmitting(true);
            toast.info('正在提交数据...');
            await submitData();
            toast.success('提交成功！');
            
            // 跳转到VideoLab页面
            window.location.href = "/app/videolab";
        } catch (error) {
            console.error('提交失败:', error);
            toast.error('提交失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <Button 
                    variant="outline" 
                    className="rounded-full border-gray-300 text-gray-700" 
                    onClick={onBack}
                    disabled={isSubmitting}
                >
                    返回
                </Button>
                <Button 
                    onClick={handleSubmit}
                    className="rounded-full border-gray-300"
                    disabled={!isFormComplete || isSubmitting}
                >
                    {isSubmitting ? '提交中...' : '完成'}
                </Button>
            </div>
        </div>
    )
}

