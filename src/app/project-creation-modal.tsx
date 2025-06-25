import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileIcon, UploadCloud, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import instance_oss from "@/api/axios-oss";
import instance from '@/api/axios';
import { v4 as uuidv4 } from 'uuid';
import { createProject } from "@/api/project";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const [processingStage, setProcessingStage] = useState<string>("");
    const [fileType, setFileType] = useState<"ppt" | "pdf">("ppt");
    const [projectName, setProjectName] = useState<string>("");
    const INVALID_FILE_ERROR = '文件大小或格式无效!';
    
    const clearData = () => {
        setUploadProgress(0);
        setUploadComplete(false);
        setFileUrl('');
        setFile(null);
        setProjectName('');
    };

    // 从文件名提取项目名称（去掉扩展名）
    const extractProjectName = (filename: string): string => {
        // 移除文件扩展名
        const name = filename.replace(/\.(pdf)$/i, '');
        return name || "未命名项目";
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // 当用户重新上传文件时，重置所有相关状态
        clearData();

        const validFile = acceptedFiles.find((file) => {
                const isPDF = file.name.endsWith('.pdf');
                const isUnderSize = file.size <= 50 * 1024 * 1024; // 50MB
                return isPDF && isUnderSize;
        });

        if (!validFile) {
            toast.error(INVALID_FILE_ERROR);
            return;
        }
        console.log("找到有效文件:", validFile.name);

        // 设置项目名称
        const name = extractProjectName(validFile.name);
        setProjectName(name);
        
        setFile(validFile);
        handleUpload(validFile);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
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
            // 获取当前用户ID
            const { user } = useAuth.getState();
            const userId = user?.userID || 'anonymous';
            
            // 如果还没有设置项目名称（以防万一），设置它
            if (!projectName && uploadFile.name) {
                const name = extractProjectName(uploadFile.name);
                setProjectName(name);
            }

            // 上传文件，加入用户ID作为前缀
            const objectKey = `/project/${fileType}/${userId}/${fileType}-${uuidv4()}`; // 生成带用户ID的唯一objectKey
            const presignedURL = await generatePresignedURL(objectKey);

            await uploadToTencentCloud(uploadFile, presignedURL.data);
            setUploadComplete(true);

            const fileUrlTemp = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`;
            setFileUrl(fileUrlTemp);
        } catch (error) {
            console.log(error);
            toast.error(`${fileType.toUpperCase()}上传失败!`);
        }
    };

    const handleCreate = async () => {
        if (!file || !uploadComplete) {
            toast.error(`请先上传${fileType.toUpperCase()}文件`);
            return;
        }

        // 检查用户是否已登录
        const { user, token } = useAuth.getState();
        if (!user || !token) {
            // 触发登录事件，显示登录框
            const event = new CustomEvent('auth:unauthorized');
            window.dispatchEvent(event);
            return;
        }

        setIsProcessing(true);

        try {
            setProcessingStage(`正在处理${fileType.toUpperCase()}文件，这可能需要一点时间...`);
            // 如果没有项目名称，则设置为"未命名项目"
            const finalProjectName = projectName.trim() || "未命名项目";
            const projectId = await createProject('pdf', fileUrl, finalProjectName);
            onCreate(projectId);
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `处理${fileType.toUpperCase()}失败，请重试!`);
        } finally {
            setIsProcessing(false);
            setProcessingStage("");
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-xl">导入文件创建项目</DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <Tabs defaultValue="pdf" className="mb-6" onValueChange={(value) => {
                        setFileType(value as "ppt" | "pdf");
                        clearData();
                    }}>
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="ppt">PPT转换指南</TabsTrigger>
                            <TabsTrigger value="pdf">PDF导入</TabsTrigger>
                        </TabsList>
                        <TabsContent value="ppt" className="mt-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="text-blue-700 font-medium mb-2">如何将PPT转换为PDF</h3>
                                <p className="text-sm text-gray-700 mb-3">为获得最佳效果，请先将PPT转换为PDF格式后再上传：</p>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start">
                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                                        <p>在WPS或Office中打开您的PPT文件</p>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                                        <p>选择"文件" &gt; "导出" 或 "另存为" &gt; "PDF格式"</p>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                                        <p>选择保存位置并点击"保存"</p>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">4</span>
                                        <p>完成后切换到"PDF导入"标签页上传转换后的文件</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="pdf" className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">从PDF文件创建项目，仅支持.pdf格式，最大50MB</p>
                    
                    {/* 上传文档区域 */}
                    <div
                        {...getRootProps()}
                        className={`
                        bg-white rounded-lg p-6 
                        flex flex-col items-center justify-center 
                        border-2 ${isDragActive ? "border-blue-500" : "border-dashed border-gray-300"} 
                        cursor-pointer transition-colors
                        ${isDragActive ? "bg-blue-50" : ""}
                        h-64 mb-6
                      `}
                    >
                        <input {...getInputProps()} />
                        <UploadCloud className={`w-12 h-12 mb-4 ${file ? "text-blue-500" : "text-gray-400"}`} />
                        <div className="text-center">
                                    <p className={`font-medium ${file ? "text-blue-600" : "text-gray-600"}`}>上传PDF文件</p>
                            <p className="text-gray-600 mt-2">点击上传或拖放文件到此处</p>
                                    <p className="text-sm text-gray-500 mt-1">仅支持.pdf格式，最大50MB</p>
                        </div>

                        {file && (
                            <div className="w-full mt-4 space-y-2">
                                <div
                                    className={`flex items-center justify-between p-3 rounded-lg ${uploadComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-2">
                                        {uploadComplete ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                                            <FileIcon className="w-4 h-4 text-gray-400" />}
                                        <span
                                            className={`text-sm ${uploadComplete ? 'text-green-600' : 'text-gray-600'}`}>{file.name}</span>
                                    </div>
                                    <span
                                        className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                                {!uploadComplete && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                        </TabsContent>
                    </Tabs>
                    
                    {/* 底部按钮区域 */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleCreate}
                            disabled={isProcessing || !file || !uploadComplete}
                            className="min-w-[100px]"
                        >
                            {isProcessing ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>{processingStage || '处理中...'}</span>
                                </div>
                            ) : '创建项目'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}