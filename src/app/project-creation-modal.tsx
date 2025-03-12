import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileIcon, FileUp, Image, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import instance_oss from "@/api/axios-oss";
import instance from '@/api/axios';
import { v4 as uuidv4 } from 'uuid';

interface ProjectCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, file: File | null) => void;
}

export function ProjectCreationModal({ isOpen, onClose, onCreate }: ProjectCreationModalProps) {
    const [projectName, setProjectName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadComplete, setUploadComplete] = useState<boolean>(false);
    const [fileUrl, setFileUrl] = useState<string>("");
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
            
            toast.info('正在上传PPT...');
            await uploadToTencentCloud(uploadFile, presignedURL.data);
            setUploadComplete(true);
            
            const fileUrlTemp = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`;
            setFileUrl(fileUrlTemp);
            
            toast.success('PPT上传成功!');
        } catch (error) {
            console.log(error);
            toast.error('PPT上传失败!');
        }
    };

    const handleCreate = () => {
        if (file) {
            onCreate(projectName || "未命名项目", file);
        } else {
            onCreate(projectName || "未命名项目", null);
        }
        onClose();
    };

    const handleCreateEmptyProject = () => {
        onCreate(projectName || "未命名项目", null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-xl">新建项目</DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4 p-6">
                    {/* 左侧 - 上传PPT文档 */}
                    <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center border">

                        
                        <div
                            {...getRootProps()}
                            className={`
                            w-full border-2 border-dashed rounded-lg p-6
                            flex flex-col items-center justify-center
                            cursor-pointer transition-colors
                            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
                          `}
                        >
                            <input {...getInputProps()} />
                            <UploadCloud className="w-8 h-8 text-gray-400 mb-4" />
                            <div className="text-center">
                                <p className="text-blue-600 font-medium">点击上传PPT</p>
                                <p className="text-gray-600">或拖放文件到此处</p>
                                <p className="text-sm text-gray-500 mt-2">仅支持.pptx格式，最大50MB</p>
                            </div>
                        </div>

                        {file && (
                            <div className="w-full mt-4 space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">PPT文件</h4>
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
                        )}
                    </div>
                    
                    {/* 右侧 - 新建空白项目 */}
                    <div 
                        className="bg-white rounded-lg p-6 flex flex-col items-center justify-center border relative cursor-pointer hover:shadow-md transition-all"
                        onClick={handleCreateEmptyProject}
                    >
                        <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                            <Image className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">新建空白项目</h3>
                        <p className="text-gray-500 text-sm text-center mb-6">从零开始创建您的项目</p>
                        
                        <Button 
                            className="mt-auto w-full cursor-pointer"
                            onClick={handleCreateEmptyProject}
                        >
                            立即创建
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}