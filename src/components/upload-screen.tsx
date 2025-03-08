import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, FileIcon, Music } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner";
import instance_oss from "@/api/axios-oss";
import { useVoiceCloning } from "@/hooks/VoiceCloningContext.tsx";
import instance from '@/api/axios'
import { v4 as uuidv4 } from 'uuid';

export default function UploadScreen({ onBack }: { onBack: () => void }) {
    const [file, setFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [uploadComplete, setUploadComplete] = useState<boolean>(false)
    const { voiceName, gender, audioUrl, setAudioUrl, language, discardData, submitData } = useVoiceCloning();
    const INVALID_FILE_ERROR = '文件大小或格式无效!';
    const isFormComplete = voiceName && gender && audioUrl && language;

    const clearData = () => {
        setUploadProgress(0);
        setUploadComplete(false);
        setAudioUrl('');
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // 当用户重新上传文件时，重置所有相关状态
        clearData();

        const validFile = acceptedFiles.find((file) => {
            const isAudio = file.type.startsWith("audio/")
            const isUnderSize = file.size <= 20 * 1024 * 1024 // 20MB
            return isAudio && isUnderSize
        })
        if (!validFile) {
            toast.error(INVALID_FILE_ERROR);
            return;
        }
        console.log("找到有效文件:", validFile.name);

        setFile(validFile);
        handleUpload(validFile);
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
        },
        maxSize: 20 * 1024 * 1024, // 20MB
    })

    const uploadToTencentCloud = async (file: File, presignedURL: string) => {
        try {
            const response = await instance_oss.put(presignedURL, file, {
                headers: {
                    'Content-Type': file.type
                },
                onUploadProgress: (progressEvent) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    setUploadProgress(progress)
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

    const handleUpload = async (uploadFile?: File) => {
        if (!uploadFile) {
            console.log("没有文件可上传");
            return;
        }
        try {
            // 上传音频文件
            const objectKey = `audio-${uuidv4()}`; // 生成唯一的objectKey
            const presignedURL = await generatePresignedURL(objectKey)
            
            toast.info('正在上传音频...');
            await uploadToTencentCloud(uploadFile, presignedURL.data)
            setUploadComplete(true)
            
            const audioUrlTemp = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`;
            setAudioUrl(audioUrlTemp);
            
            toast.success('音频上传成功!')
        } catch (error) {
            console.log(error)
            toast.error('音频上传失败!')
        }
    }

    const discardVoideCloing = () => {
        discardData()
        //跳转到 home页面
        window.location.href = "/home";
    }
    
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex justify-between items-center p-6">
                <h1 className="text-xl font-medium text-gray-800">创建您的虚拟形象</h1>
                <Button onClick={discardVoideCloing} variant="outline" className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50">
                    回到主页
                </Button>
            </div>

            <div className="flex justify-center items-center px-4">
                <div className="bg-white rounded-lg shadow-sm w-full max-w-2xl p-8">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-medium text-gray-800">上传音频样本</h2>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-800">如何克隆您的声音</h3>
                            <p className="text-gray-600 leading-relaxed">
                                克隆您的声音需要一个样本。样本质量很重要。
                                嘈杂的样本可能导致声音效果不佳，
                                请提供约30秒的清晰、无回音、音频文件。
                            </p>
                        </div>

                        <div
                            {...getRootProps()}
                            className={`
                            border-2 border-dashed rounded-lg p-8
                            flex flex-col items-center justify-center
                            cursor-pointer transition-colors
                            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                          `}
                        >
                            <input {...getInputProps()} />
                            <Music className="w-8 h-8 text-gray-400 mb-4" />
                            <div className="text-center">
                                <p className="text-blue-600 font-medium">点击上传文件</p>
                                <p className="text-gray-600">或拖放文件到此处</p>
                                <p className="text-sm text-gray-500 mt-2">音频文件，每个最大20MB</p>
                            </div>
                        </div>

                        {file && (
                            <div className="space-y-4">
                                {/* Audio file info */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">音频文件</h4>
                                    <div
                                        className={`flex items-center justify-between p-3 rounded-lg ${uploadComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-2">
                                            {uploadComplete ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                                                <FileIcon className="w-4 h-4 text-gray-400" />}
                                            <span
                                                className={`text-sm ${uploadComplete ? 'text-green-600' : 'text-gray-600'}`}>{file.name}</span>
                                        </div>
                                        <span
                                            className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    </div>
                                    {!uploadComplete && (
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" className="rounded-full border-gray-300 text-gray-700"
                                onClick={onBack}>
                                返回
                            </Button>
                            {isFormComplete && (
                                <Button onClick={submitData} className="rounded-full border-gray-300 ">
                                    完成
                                </Button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}