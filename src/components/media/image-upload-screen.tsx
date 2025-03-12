"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, CheckCircle, Crop } from "lucide-react"
import { useVoiceCloning } from '@/hooks/VoiceCloningContext'
import instance_oss from "@/api/axios-oss"
import instance from '@/api/axios'
import { v4 as uuidv4 } from 'uuid'
import { toast } from "sonner"
import VoiceOptionScreen from "@/components/voice/voice-option-screen"
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop'
import { faceDetect } from "@/api/aliyun"
export default function ImageUploadScreen({ onBack }: { onBack: () => void }) {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadComplete, setUploadComplete] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showOption, setShowOption] = useState(false)
    const { setAvatarUrl, setDetectionResult} = useVoiceCloning()

    // 新增状态
    const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4">("1:1")
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [originalImage, setOriginalImage] = useState<string | null>(null)
    const [isCropping, setIsCropping] = useState(false)
    const [isDetecting, setIsDetecting] = useState(false)

    // 检查图片尺寸
    const checkImageDimensions = (img: HTMLImageElement): boolean => {
        const { width, height } = img;

        // 检查最小边长和最大边长
        const minSide = Math.min(width, height);
        const maxSide = Math.max(width, height);

        if (minSide < 400) {
            toast.error('图片最小边长需要≥400像素');
            return false;
        }

        if (maxSide > 7000) {
            toast.error('图片最大边长需要≤7000像素');
            return false;
        }

        return true;
    };

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

    // 修改 handleImageFile 函数
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

            // 创建图片对象以获取尺寸
            const img = new Image();
            img.onload = () => {
                if (checkImageDimensions(img)) {
                    setOriginalImage(imageResult);
                    setIsCropping(true);
                }
            };
            img.src = imageResult;
        }
        reader.readAsDataURL(file)
    }
    // 裁剪完成后的回调
    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // 生成裁剪后的图片
    const createCroppedImage = async () => {
        if (!originalImage || !croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(
                originalImage,
                croppedAreaPixels
            );

            setSelectedImage(croppedImage);
            setIsCropping(false);

            // 检测人脸
            detectFace(croppedImage);
        } catch (e) {
            console.error('裁剪失败:', e);
            toast.error('图片裁剪失败');
        }
    };

    // 裁剪图片的工具函数
    const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<string> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imageSrc;

            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('无法获取canvas上下文'));
                    return;
                }

                // 设置canvas尺寸为裁剪区域大小
                canvas.width = pixelCrop.width;
                canvas.height = pixelCrop.height;

                // 绘制裁剪后的图像
                ctx.drawImage(
                    image,
                    pixelCrop.x,
                    pixelCrop.y,
                    pixelCrop.width,
                    pixelCrop.height,
                    0,
                    0,
                    pixelCrop.width,
                    pixelCrop.height
                );

                // 转换为base64
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };

            image.onerror = () => {
                reject(new Error('图片加载失败'));
            };
        });
    };
    // 人脸检测
    const detectFace = async (imageData: string) => {
        setIsDetecting(true);
        try {
            // 将 base64 转换回文件并上传
            const base64Response = await fetch(imageData);
            const blob = await base64Response.blob();
            const file = new File([blob], 'temp.jpg', { type: 'image/jpeg' });

            // 上传图片文件获取URL
            const objectKey = `temp-${uuidv4()}`;
            const presignedURL = await generatePresignedURL(objectKey);
            await uploadToTencentCloud(file, presignedURL.data, file.type);

            const imageUrl = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`;

            // 调用人脸检测API
            const result = await faceDetect({
                image_url: imageUrl,
                ratio: aspectRatio === "1:1" ? "1:1" : "3:4"
            });
            if (!result.checkPass) {
                return;
            }
            setDetectionResult(result);
            // 检测通过后上传最终图片
            uploadImage(imageData, 'image/jpeg');

        } catch (error) {
            console.error('人脸检测失败:', error);
            toast.error('人脸检测失败，请重试');
        } finally {
            setIsDetecting(false);
        }
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

            // 上传图片文件，添加文件扩展名到 objectKey
            const fileExtension = contentType.split('/').pop() || 'jpg'
            const objectKey = `avatar-${uuidv4()}.${fileExtension}`
            const presignedURL = await generatePresignedURL(objectKey)

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
    if (showOption) {
        return <VoiceOptionScreen onBack={() => setShowOption(false)} />
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
{/* 添加裁剪界面 */}
            {isCropping && originalImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-3xl p-6">
                        <h3 className="text-xl font-medium text-gray-800 mb-4">裁剪图片</h3>
                        
                        {/* 画幅选择 */}
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setAspectRatio("1:1")}
                                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm ${
                                    aspectRatio === "1:1" 
                                        ? "bg-gray-200 text-gray-800 font-medium" 
                                        : "bg-white text-gray-500 border border-gray-200"
                                }`}
                            >
                                <Crop className="w-4 h-4" />
                                1:1 (头像)
                            </button>
                            <button
                                onClick={() => setAspectRatio("3:4")}
                                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm ${
                                    aspectRatio === "3:4" 
                                        ? "bg-gray-200 text-gray-800 font-medium" 
                                        : "bg-white text-gray-500 border border-gray-200"
                                }`}
                            >
                                <Crop className="w-4 h-4" />
                                3:4 (半身像)
                            </button>
                        </div>
                        
                        {/* 裁剪区域 */}
                        <div className="relative h-80 w-full mb-4">
                            <Cropper
                                image={originalImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio === "1:1" ? 1 : 3/4}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        
                        {/* 缩放控制 */}
                        <div className="flex items-center mb-4">
                            <span className="text-sm text-gray-600 mr-2">缩放:</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1"
                            />
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setIsCropping(false);
                                    setOriginalImage(null);
                                }}
                            >
                                取消
                            </Button>
                            <Button onClick={createCroppedImage}>
                                确认裁剪
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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
                                {isDetecting && (
                                    <div className="flex items-center justify-center text-blue-500 space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                        <span>正在检测人脸...</span>
                                    </div>
                                )}
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
                                onClick={() => {
                                    setShowOption(true)
                                }}
                                disabled={!uploadComplete || isDetecting} // 只有上传完成且不在检测中才能进入下一步
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