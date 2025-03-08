"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, CheckCircle } from "lucide-react"
import { useVoiceCloning } from '@/hooks/VoiceCloningContext'
import instance_oss from "@/api/axios-oss"
import instance from '@/api/axios'
import { v4 as uuidv4 } from 'uuid'
import { toast } from "sonner"
import VoiceOptionScreen from "@/components/voice-option-screen"
import avatarImage from "@/assets/avatar.png"
export default function ImageUploadScreen({ onBack }: { onBack: () => void }) {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadComplete, setUploadComplete] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showOption, setShowOption] = useState(false)
    const { setAvatarUrl } = useVoiceCloning()

    if (showOption) {
        return <VoiceOptionScreen onBack={() => setShowOption(false)}/>
    }
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0])
        }
    }

    const handleImageFile = (file: File) => {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            toast.error('请上传图片文件')
            return
        }

        // 检查文件大小 (限制为 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('图片大小不能超过 5MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const imageResult = e.target?.result as string
            setSelectedImage(imageResult)

            // 选择图片后自动上传
            uploadImage(imageResult, file.type)
        }
        reader.readAsDataURL(file)
    }

    const uploadToTencentCloud = async (file: File, presignedURL: string, contentType: string) => {
        try {
            const response = await instance_oss.put(presignedURL, file, {
                headers: {
                    'Content-Type': contentType
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        setUploadProgress(progress)
                    }
                }
            })
            return response
        } catch (error) {
            console.error('上传到腾讯云失败:', error)
            throw error
        }
    }

    const generatePresignedURL = async (objectKey: string) => {
        try {
            const response = await instance.get(`/generatePresignedURL`, {
                params: { objectKey }
            })
            return response.data
        } catch (error) {
            console.error('获取预签名URL失败:', error)
            throw error
        }
    }

    // 新增方法：处理图片上传
    const uploadImage = async (imageData: string, contentType: string) => {
        setIsUploading(true)
        setUploadProgress(0)

        try {
            // 将 base64 转换回文件
            const base64Response = await fetch(imageData)
            const blob = await base64Response.blob()
            const file = new File([blob], 'avatar.jpg', { type: contentType })

            // 上传图片文件
            const objectKey = `avatar-${uuidv4()}`
            const presignedURL = await generatePresignedURL(objectKey)

            toast.info('正在上传图片...')
            await uploadToTencentCloud(file, presignedURL.data, file.type)

            const imageUrlTemp = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`
            setAvatarUrl(imageUrlTemp)

            setUploadComplete(true)
            toast.success('图片上传成功!')
        } catch (error) {
            console.error('上传失败:', error)
            toast.error('图片上传失败!')
        } finally {
            setIsUploading(false)
        }
    }


    const removeImage = () => {
        setSelectedImage(null)
        setUploadComplete(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex justify-between items-center p-6">
                <h1 className="text-xl font-medium text-gray-800">创建您的虚拟形象</h1>
                <Button
                    variant="outline"
                    className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                        window.location.href = "/home"
                    }}
                >
                    回到主页
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex justify-center items-center px-4">
                <div className="bg-white rounded-lg shadow-sm w-full max-w-3xl p-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-medium text-gray-800">上传您的头像</h2>
                        <p className="text-gray-600">
                            请上传一张清晰的正面照片，这将用于创建您的虚拟形象。
                        </p>
                        <p className="text-gray-600">
                            图像最小边长≥400像素，最大边长≤7000像素。
                        </p>
                        <p className="text-gray-600">
                            希望检测确认的画幅，可选 "1:1"或"3:4"，1:1适用于头像图片，3:4适用于半身像图片。
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center mb-2">
                                <h3 className="text-md font-medium text-gray-700">示例照片</h3>
                            </div>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <div className="text-center">
                                    <img 
                                        src={avatarImage}
                                        alt="示例头像 1" 
                                        className="w-24 h-24 object-cover rounded-lg border border-green-300"
                                    />
                                    <p className="text-xs text-green-600 mt-1">✓ 推荐</p>
                                </div>

                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                请上传清晰的正面照片，避免侧脸、遮挡面部或模糊的照片
                            </p>
                        </div>
                        {!selectedImage ? (
                            <div
                                className={`border-2 border-dashed rounded-lg p-12 text-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="p-4 bg-gray-100 rounded-full">
                                        <ImageIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800">拖放图片到这里</h3>
                                        <p className="text-sm text-gray-500 mt-1">或者点击下方按钮选择文件</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-4"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        选择图片
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <img
                                        src={selectedImage}
                                        alt="Selected"
                                        className="max-h-80 mx-auto rounded-lg object-contain"
                                    />
                                    <button
                                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full"
                                        onClick={removeImage}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {isUploading && !uploadComplete && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>上传进度</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {uploadComplete && (
                                    <div className="flex items-center justify-center text-green-500 space-x-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>上传成功</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                            <Button
                                variant="outline"
                                className="rounded-full border-gray-300 text-gray-700"
                                onClick={onBack}
                            >
                                返回
                            </Button>

                            <Button
                                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                onClick={()=>{
                                    setShowOption(true)
                                }}
                                disabled={!uploadComplete} // 只有上传完成后才能进入下一步
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