"use client"

import {useEffect, useState} from "react"
import {X} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function LoginModal({isOpen, onClose}: LoginModalProps) {
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleGetCode = () => {
        setCountdown(60)
        // Here you would typically call an API to send the verification code
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl w-full max-w-3xl flex overflow-hidden relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6 cursor-pointer"/>
                </button>

                {/* Left Section */}
                <div className="flex-1 p-12 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-2">立即登录</h2>
                    <p className="text-gray-500 mb-8">即可免费使用全部功能</p>
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
                        <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%AA%E5%B1%8F2025-02-25%2008.09.59-pVrcvul9RDBcpBJ34paDoLvEHttSpm.png"
                            alt="WeChat QR Code"
                            width={180}
                            height={180}
                            className="w-[180px] h-[180px]"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <img src="/placeholder.svg?height=24&width=24" alt="WeChat" width={24} height={24}
                             className="w-6 h-6"/>
                        <span>微信扫码登录</span>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex-1 p-12 bg-gray-50">
                    <h2 className="text-2xl font-bold mb-8">手机号登录</h2>
                    <div className="space-y-8">
                        <Input type="tel" placeholder="请输入手机号" className="h-12 bg-white"/>
                        <div className="flex gap-2">
                            <Input type="text" placeholder="请输入验证码" className="h-12 bg-white"/>
                            <Button
                                variant="outline"
                                className="whitespace-nowrap h-12 px-2"
                                onClick={handleGetCode}
                                disabled={countdown > 0}
                            >
                                {countdown > 0 ? `${countdown}s` : "获取验证码"}
                            </Button>
                        </div>
                        <Button
                            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-[#FFE4E1] via-[#E6E6FA] to-[#E0FFFF] hover:opacity-90 text-gray-800">
                            立即登录
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

