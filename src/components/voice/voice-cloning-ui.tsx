"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserIcon as Male, UserIcon as Female } from "lucide-react"
import ImageUploadScreen from "@/components/media/image-upload-screen"
import { useVoiceCloning } from '@/hooks/VoiceCloningContext';
import { useLocation } from "react-router-dom"

export default function VoiceCloningUI() {
    const { voiceName, setVoiceName, gender, setGender, language, setLanguage, discardData, setEditingVoice, isEditMode } = useVoiceCloning();
    const [nameError, setNameError] = useState<string>("");
    const [currentScreen, setCurrentScreen] = useState<"naming" | "upload">("naming")
    const location = useLocation();
    const voice = location.state?.voice;

    // 只在组件首次加载时设置编辑数据，避免重复设置导致的问题
    useEffect(() => {
        if (voice) {
            setEditingVoice(voice);
        }
    }, []);

    // 验证名称长度
    const validateName = (name: string) => {
        if (name.length < 2 || name.length > 20) {
            setNameError("名称长度必须在2到20个字符之间");
            return false;
        }
        setNameError("");
        return true;
    };

    // 处理名称输入变化
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setVoiceName(newName);
        validateName(newName);
    };

    const handleCreateVoice = () => {
        // 在进入下一步前验证名称
        if (validateName(voiceName)) {
            setCurrentScreen("upload");
        }
    }

    const handleBack = () => {
        setCurrentScreen("naming")
    }

    if (currentScreen === "upload") {
        return <ImageUploadScreen onBack={handleBack} />
    }
    const discardVoideCloing = () => {
        discardData()
        //跳转到 home页面
        window.location.href = "/home";
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center p-6">
                <h1 className="text-xl font-medium text-gray-800">
                    {isEditMode ? "修改您的虚拟形象" : "创建您的虚拟形象"}
                </h1>
                <Button onClick={discardVoideCloing} variant="outline"
                    className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50">
                    回到主页
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex justify-center items-center px-4">
                <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-8">
                    <div className="space-y-6">
                        {/* Voice Name Section */}
                        <div className="space-y-2">
                            <h2 className="text-lg font-medium text-gray-800">名称</h2>
                            <p className="text-sm text-gray-500">为您的虚拟形象命名</p>

                            <Input
                                value={voiceName}
                                onChange={handleNameChange}
                                className={`border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none ${nameError ? "border-red-500" : ""}`}
                            />
                            {nameError && (
                                <p className="text-red-500 text-xs mt-1">{nameError}</p>
                            )}
                        </div>

                        {/* Gender Selection - 修改这里的按钮点击事件和条件判断 */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-700">性别</h3>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setGender("男")}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm ${gender === "男" ? "bg-gray-200 text-gray-800" : "bg-white text-gray-500 border border-gray-200"
                                        }`}
                                >
                                    <Male className="w-4 h-4" />
                                    男
                                </button>

                                <button
                                    onClick={() => setGender("女")}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm ${gender === "女" ? "bg-gray-200 text-gray-800" : "bg-white text-gray-500 border border-gray-200"
                                        }`}
                                >
                                    <Female className="w-4 h-4" />
                                    女
                                </button>
                            </div>
                        </div>
                        {/* Language Selection - 修改这里的按钮点击事件和条件判断 */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-700">语言</h3>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setLanguage("中文")}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm ${language === "中文" ? "bg-gray-200 text-gray-800" : "bg-white text-gray-500 border border-gray-200"
                                        }`}
                                >
                                    <span className="w-4 h-4">🇨🇳</span>
                                    中文
                                </button>

                                <button
                                    onClick={() => setLanguage("英语")}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm ${language === "英语" ? "bg-gray-200 text-gray-800" : "bg-white text-gray-500 border border-gray-200"
                                        }`}
                                >
                                    <span className="w-4 h-4">🇬🇧</span>
                                    英语
                                </button>
                            </div>
                        </div>
                        {/* Create Button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                onClick={handleCreateVoice}
                                disabled={!voiceName || nameError !== ""}
                            >
                                下一步
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

