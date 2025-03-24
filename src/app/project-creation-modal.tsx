import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileIcon, Image, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import instance_oss from "@/api/axios-oss";
import instance from '@/api/axios';
import { v4 as uuidv4 } from 'uuid';
import { createProject } from "@/api/project";

interface ProjectCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (projectId: string) => void;
}

export function ProjectCreationModal({ isOpen, onClose, onCreate }: ProjectCreationModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadComplete, setUploadComplete] = useState<boolean>(false);
    const [fileUrl, setFileUrl] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<"empty" | "ppt" | null>(null);
    const INVALID_FILE_ERROR = '文件大小或格式无效!';

    const clearData = () => {
        setUploadProgress(0);
        setUploadComplete(false);
        setFileUrl('');
        setFile(null);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // 当用户重新上传文件时，重置所有相关状态
        clearData();
        setSelectedOption("ppt"); // 确保选中PPT选项

        const validFile = acceptedFiles.find((file) => {
            const isPPTX = file.name.endsWith('.pptx');
            const isUnderSize = file.size <= 50 * 1024 * 1024; // 50MB
            return isPPTX && isUnderSize;
        });

        if (!validFile) {
            toast.error(INVALID_FILE_ERROR);
            return;
        }
        console.log("找到有效文件:", validFile.name);

        setFile(validFile);
        handleUpload(validFile);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        },
        maxSize: 50 * 1024 * 1024, // 50MB
    });

    const uploadToTencentCloud = async (file: File, presignedURL: string) => {
        try {
            const response = await instance_oss.put(presignedURL, file, {
                headers: {
                    'Content-Type': file.type
                },
                onUploadProgress: (progressEvent) => {
                    // @ts-expect-error
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });
            return response;
        } catch (error) {
            console.error('上传到腾讯云失败:', error);
            throw error;
        }
    };

    const generatePresignedURL = async (objectKey: string) => {
        try {
            const response = await instance.get(`/generatePresignedURL`, {
                params: { objectKey }
            });
            return response.data;
        } catch (error) {
            console.error('获取预签名URL失败:', error);
            throw error;
        }
    };

    const handleUpload = async (uploadFile?: File) => {
        if (!uploadFile) {
            console.log("没有文件可上传");
            return;
        }
        try {
            // 上传PPT文件
            const objectKey = `ppt-${uuidv4()}`; // 生成唯一的objectKey
            const presignedURL = await generatePresignedURL(objectKey);

            await uploadToTencentCloud(uploadFile, presignedURL.data);
            setUploadComplete(true);

            const fileUrlTemp = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`;
            setFileUrl(fileUrlTemp);

            setSelectedOption("ppt"); // 确保选中PPT选项
        } catch (error) {
            console.log(error);
            toast.error('PPT上传失败!');
        }
    };

    // 修改后的 handleCreate 方法
    const handleCreate = async () => {
        if (!selectedOption) {
            toast.error('请选择创建方式');
            return;
        }
        setIsProcessing(true);
        
        try {
            const projectId = await createProject(selectedOption, fileUrl);
            onCreate(projectId);
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '处理PPT失败，请重试!');
        } finally {
            setIsProcessing(false);
        }
    }
    


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-xl">新建项目</DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* 左侧 - 上传PPT文档 */}
                        <div
                            {...getRootProps()}
                            className={`
                            bg-white rounded-lg p-6 
                            flex flex-col items-center justify-center 
                            border-2 ${selectedOption === "ppt" ? "border-blue-500" : "border-dashed border-gray-300"} 
                            cursor-pointer transition-colors
                            ${isDragActive ? "bg-blue-50" : ""}
                            ${selectedOption === "ppt" ? "ring-2 ring-blue-200" : ""}
                            h-48
                          `}
                        >
                            <input {...getInputProps()} />
                            <UploadCloud className={`w-8 h-8 mb-3 ${selectedOption === "ppt" ? "text-blue-500" : "text-gray-400"}`} />
                            <div className="text-center">
                                <p className={`font-medium ${selectedOption === "ppt" ? "text-blue-600" : "text-gray-600"}`}>从PPT创建</p>
                                <p className="text-gray-600 mt-1 text-sm">点击上传或拖放文件</p>
                                <p className="text-xs text-gray-500 mt-1">仅支持.pptx格式，最大50MB</p>
                            </div>

                            {file && (
                                <div className="w-full mt-3 space-y-1">
                                    <div
                                        className={`flex items-center justify-between p-2 rounded-lg ${uploadComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-2">
                                            {uploadComplete ? <CheckCircle className="w-3 h-3 text-green-500" /> :
                                                <FileIcon className="w-3 h-3 text-gray-400" />}
                                            <span
                                                className={`text-xs ${uploadComplete ? 'text-green-600' : 'text-gray-600'}`}>{file.name}</span>
                                        </div>
                                        <span
                                            className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    </div>
                                    {!uploadComplete && (
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div className="bg-blue-600 h-1.5 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 右侧 - 新建空白项目 */}
                        <div
                            className={`
                                bg-white rounded-lg p-6 
                                flex flex-col items-center justify-center 
                                border-2 ${selectedOption === "empty" ? "border-blue-500" : "border-gray-300"} 
                                relative cursor-pointer transition-all
                                ${selectedOption === "empty" ? "ring-2 ring-blue-200" : ""}
                                h-48
                            `}
                            onClick={() => setSelectedOption("empty")}
                        >
                            <div className={`mb-3 p-3 rounded-full ${selectedOption === "empty" ? "bg-blue-100" : "bg-gray-100"}`}>
                                <Image className={`w-8 h-8 ${selectedOption === "empty" ? "text-blue-500" : "text-gray-500"}`} />
                            </div>
                            <h3 className="font-medium">空白项目</h3>
                            <p className="text-gray-500 text-sm text-center mt-1">从零开始创建</p>
                        </div>
                    </div>

                    {/* 底部按钮区域 */}
                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={handleCreate}
                            disabled={isProcessing || (selectedOption === "ppt" && (!file || !uploadComplete))}
                        >
                            {isProcessing ? '处理中...' : '创建'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}