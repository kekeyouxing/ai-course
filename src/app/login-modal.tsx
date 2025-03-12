""
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth.ts";
import instance from "@/api/axios.ts";
import { toast } from "sonner";
interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const [phone, setPhone] = useState("")
    const [code, setCode] = useState("")
    const [countdown, setCountdown] = useState(0)
    const [phoneError, setPhoneError] = useState("")
    const { login } = useAuth()

    // 验证手机号格式
    const validatePhone = (phoneNumber: string) => {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phoneNumber);
    }

    // 处理手机号输入变化
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhone(value);
        
        if (value && !validatePhone(value)) {
            setPhoneError("请输入正确的手机号码");
        } else {
            setPhoneError("");
        }
    }

    // 使用 Promise 方式处理登录请求
    const handleLogin = () => {
        // 在提交前再次验证手机号
        if (!validatePhone(phone)) {
            setPhoneError("请输入正确的手机号码");
            return;
        }
        
        instance.post("/login", { phone, code })
            .then(res => {
                // 检查返回数据是否包含 token
                if (res.data && res.data.code === 0 && res.data.data) {
                    login(res.data.data.token);
                    onSuccess();
                    toast.success("登录成功");
                } else {
                    // 服务器返回了响应但没有 token
                    toast.error(res.data.msg);
                }
            })
            .catch(err => {
                // 处理请求错误
                toast.error("登录失败，请检查手机号和验证码是否正确");
                console.log("登录请求错误:", err);
            });
    };
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleGetCode = () => {
        // 验证手机号
        if (!validatePhone(phone)) {
            setPhoneError("请输入正确的手机号码");
            return;
        }
        
        setCountdown(60);
        instance.post("/sendSMS", { phone })
            .then(res => {
                // 检查返回数据是否包含 token
                if (res.data && res.data.code === 0) {
                    toast.success("验证码已发送");
                } else {
                    // 服务器返回了响应但没有 token
                    toast.error(res.data.msg);
                }
            })
            .catch(err => {
                // 处理请求错误
                toast.error("验证码发送失败");
                console.log("验证码发送请求错误:", err);
            });
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl w-full max-w-3xl flex overflow-hidden relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6 cursor-pointer" />
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
                            className="w-6 h-6" />
                        <span>微信扫码登录</span>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex-1 p-12 bg-gray-50">
                    <h2 className="text-2xl font-bold mb-8">手机号登录</h2>
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <Input
                                type="tel"
                                placeholder="请输入手机号"
                                className={`h-12 bg-white ${phoneError ? "border-red-500" : ""}`}
                                value={phone}
                                onChange={handlePhoneChange} />
                            {phoneError && (
                                <p className="text-red-500 text-xs">{phoneError}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="请输入验证码"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="h-12 bg-white" />
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
                            onClick={handleLogin}
                            className="cursor-pointer w-full h-12 text-lg font-medium bg-gradient-to-r from-[#FFE4E1] via-[#E6E6FA] to-[#E0FFFF] hover:opacity-90 text-gray-800">
                            立即登录
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

