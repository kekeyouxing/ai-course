"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, CirclePlay, Trash, X, FileIcon, Mic} from "lucide-react"
import { toast } from "sonner";
import { useVoiceCloning } from '@/hooks/VoiceCloningContext';
import instance_oss from "@/api/axios-oss";
import instance from '@/api/axios';
import { v4 as uuidv4 } from 'uuid';

export function VideoRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const recordedChunks = useRef<Blob[]>([]);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdown, setCountdown] = useState(4);
    const countdownIntervalRef = useRef<NodeJS.Timeout>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    
    // 直接使用VoiceCloning上下文
    const { setAudioUrl, setVoiceId, setFileId, audioUrl } = useVoiceCloning();
    
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadComplete, setUploadComplete] = useState<boolean>(false);
    const [audioSize, setAudioSize] = useState<number>(0);
    const [isCloning, setIsCloning] = useState<boolean>(false);
    const [processing, setProcessing] = useState<boolean>(false);
    
    const closePopup = () => {
        setIsPopupVisible(false);
    };
    
    const openPopup = () => {
        setIsPopupVisible(true);
    };
    
    // 停止录制函数
    const stopRecording = () => {
        setCountdown(4);
        setIsCountingDown(false);
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };
    
    // 添加重置状态的函数
    const resetStates = () => {
        setAudioUrl(null);
        setVoiceId("");
        setFileId(0);
        setUploadProgress(0);
        setUploadComplete(false);
        setAudioSize(0);
        setRecordingDuration(0);
        setIsCloning(false);
        setProcessing(false);
        recordedChunks.current = [];
    };

    // 开始倒计时
    const startCountdown = async () => {
        try {
            // 重置所有状态，确保新录制开始时清空上一次的数据
            resetStates();
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            // 开始倒计时
            let count = 3;
            setCountdown(count);
            countdownIntervalRef.current = setInterval(() => {
                if (count <= 0) {
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                    }
                    startRecording(stream);
                    return;
                }
                setCountdown(count);
                count--;
            }, 1000);

        } catch (error) {
            console.error('设备访问失败:', error)
            toast.error("无法访问麦克风，请检查权限设置");
        }
    };
    
    const startRecording = async (stream: MediaStream) => {
        try {
            setIsCountingDown(true);
            // 初始化媒体录制器，优先尝试mp3格式
            let options = {};
            
            // 检查浏览器支持的格式
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/webm' };
                console.log("使用webm格式录音");
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                options = { mimeType: 'audio/ogg' };
                console.log("使用ogg格式录音");
            } else {
                console.log("使用默认格式录音");
            }
            
            const mediaRecorder = new MediaRecorder(stream, options);
            console.log("最终使用的录音格式:", mediaRecorder.mimeType);

            mediaRecorderRef.current = mediaRecorder;
            recordedChunks.current = [];

            // 录制开始事件
            mediaRecorder.onstart = () => {
                setIsRecording(true);
                // 确保在录制开始时清除之前的录制结果
                setAudioUrl(null);
                setVoiceId("");
                setFileId(0);
                setUploadProgress(0);
                setUploadComplete(false);
                setAudioSize(0);
                setIsCloning(false);
                
                startTimeRef.current = Date.now();
                intervalRef.current = setInterval(() => {
                    const duration = Math.floor((Date.now() - startTimeRef.current!) / 1000);
                    setRecordingDuration(duration);
                    if (duration >= 30) {
                        stopRecording();
                    }
                }, 1000);
            };

            // 数据可用事件
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.current.push(event.data);
                }
            };
            
            const uploadToTencentCloud = async (file: Blob, presignedURL: string, contentType: string) => {
                try {
                    const response = await instance_oss.put(presignedURL, file, {
                        headers: {
                            'Content-Type': contentType
                        },
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                setUploadProgress(progress);
                            }
                        }
                    });
                    return response;
                } catch (error) {
                    console.error('上传到腾讯云失败:', error);
                    throw error;
                }
            };
            
            // 获取预签名URL
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
            
            // 处理音频转换 - 使用FFmpeg.wasm库转换为mp3格式
            const convertAudioToMp3 = async (audioBlob: Blob): Promise<Blob> => {
                // 创建一个空的音频上下文
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                
                // 读取音频数据
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                
                // 创建离线音频上下文以重新编码
                const offlineAudioContext = new OfflineAudioContext({
                    numberOfChannels: audioBuffer.numberOfChannels,
                    length: audioBuffer.length,
                    sampleRate: audioBuffer.sampleRate
                });
                
                // 创建音频源
                const source = offlineAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(offlineAudioContext.destination);
                source.start();
                
                // 渲染音频
                const renderedBuffer = await offlineAudioContext.startRendering();
                
                // 将渲染的音频转换为wav格式
                const wavBlob = audioBufferToWav(renderedBuffer);
                
                console.log("音频已转换为WAV格式，大小:", wavBlob.size);
                return wavBlob;
            };
            
            // AudioBuffer转WAV格式
            const audioBufferToWav = (buffer: AudioBuffer): Blob => {
                const numOfChannels = buffer.numberOfChannels;
                const length = buffer.length * numOfChannels * 2;
                const sampleRate = buffer.sampleRate;
                
                // 创建ArrayBuffer
                const arrayBuffer = new ArrayBuffer(44 + length);
                const view = new DataView(arrayBuffer);
                
                // 写入WAV头部
                // "RIFF"
                writeString(view, 0, 'RIFF');
                // 文件大小
                view.setUint32(4, 36 + length, true);
                // "WAVE"
                writeString(view, 8, 'WAVE');
                // "fmt "
                writeString(view, 12, 'fmt ');
                // 16字节格式块长度
                view.setUint32(16, 16, true);
                // PCM格式 = 1
                view.setUint16(20, 1, true);
                // 通道数
                view.setUint16(22, numOfChannels, true);
                // 采样率
                view.setUint32(24, sampleRate, true);
                // 字节率 = 采样率 * 通道数 * 2
                view.setUint32(28, sampleRate * numOfChannels * 2, true);
                // 块对齐 = 通道数 * 2
                view.setUint16(32, numOfChannels * 2, true);
                // 每个样本的位数
                view.setUint16(34, 16, true);
                // "data"
                writeString(view, 36, 'data');
                // 数据长度
                view.setUint32(40, length, true);
                
                // 写入PCM样本数据
                const channels = [];
                for (let i = 0; i < numOfChannels; i++) {
                    channels.push(buffer.getChannelData(i));
                }
                
                let offset = 44;
                for (let i = 0; i < buffer.length; i++) {
                    for (let channel = 0; channel < numOfChannels; channel++) {
                        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
                        const sample16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                        view.setInt16(offset, sample16, true);
                        offset += 2;
                    }
                }
                
                return new Blob([view], { type: 'audio/wav' });
            };
            
            // 写入字符串到DataView
            const writeString = (view: DataView, offset: number, string: string) => {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            };
            
            // 处理上传
            const handleUpload = async (audioBlob: Blob) => {
                if (!audioBlob) {
                    console.log("没有音频可上传");
                    return;
                }
                try {
                    // 设置处理状态，禁用按钮
                    setProcessing(true);
                    // 转换音频格式为WAV
                    let processedBlob;
                    try {
                        processedBlob = await convertAudioToMp3(audioBlob);
                    } catch (error) {
                        console.error("音频转换失败:", error);
                        toast.error("音频转换失败，请重试");
                        setProcessing(false);
                        return;
                    }
                    
                    // 使用wav扩展名，符合服务器要求
                    const fileExtension = 'wav';
                    const objectKey = `audio-${uuidv4()}.${fileExtension}`;
                    
                    toast.info("正在上传音频...");
                    const presignedURL = await generatePresignedURL(objectKey);
                    
                    // 上传转换后的音频
                    await uploadToTencentCloud(processedBlob, presignedURL.data, 'audio/wav');
                    
                    // 设置音频URL
                    const audioUrlTemp = `https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/${objectKey}`;
                    setAudioUrl(audioUrlTemp);
                    console.log(audioUrlTemp);
                    toast.success('音频上传成功!');
                    
                    // 调用声音克隆接口
                    setIsCloning(true);
                    try {
                        const response = await instance.post('/characters/uploadCharacterVoice', { audioUrl: audioUrlTemp });
                        
                        // 判断返回结果
                        if (response.data && response.data.data) {
                            toast.success('声音克隆成功!');
                            setVoiceId(response.data.data.voiceId);
                            setFileId(response.data.data.fileId);
                            setAudioUrl(audioUrlTemp);
                            setUploadComplete(true); // 完成所有流程
                        } else {
                            // 如果后端返回了错误信息，则显示该信息
                            const errorMessage = response.data?.msg || '声音克隆失败，请重试!';
                            console.error('声音克隆失败:', errorMessage);
                            toast.error(errorMessage);
                        }
                    } catch (error) {
                        console.error('声音克隆失败:', error);
                        toast.error('声音克隆失败，请重试!');
                    } finally {
                        setIsCloning(false);
                        setProcessing(false);
                    }
                } catch (error) {
                    console.error('上传失败:', error);
                    toast.error('音频上传失败!');
                    setProcessing(false);
                }
            };
            
            // 录制结束事件
            mediaRecorder.onstop = () => {
                const duration = Math.floor((Date.now() - startTimeRef.current!) / 1000);
                if (duration < 10) {
                    toast.error("录制时长不足 10 秒，请重新录制");
                    // 清理资源
                    stream.getTracks().forEach(track => track.stop());
                    clearInterval(intervalRef.current!);
                    setIsRecording(false);
                    setRecordingDuration(0)
                    return;
                }
                
                // 创建录制的Blob
                console.log("录制完成，格式:", mediaRecorder.mimeType);
                const audioBlob = new Blob(recordedChunks.current, {
                    type: mediaRecorder.mimeType // 保持原始录制格式
                });
                const url = URL.createObjectURL(audioBlob);

                // 清理资源
                stream.getTracks().forEach(track => track.stop());
                clearInterval(intervalRef.current!);
                setIsRecording(false);
                
                // 自动开始上传音频
                setAudioSize(audioBlob.size);
                handleUpload(audioBlob);
            };

            // 开始录制（每100ms收集一次数据）
            mediaRecorder.start(100);
        } catch (error) {
            console.error("启动录制失败:", error);
            toast.error("无法访问麦克风，请检查权限设置");
        }
    };
    
    return (
        <div className="h-full flex flex-col justify-between p-6 bg-gray-100">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">音频录制</h2>
            <div className="flex-grow flex flex-col justify-center items-center space-y-6">
                <div className="relative space-y-4 rounded-lg bg-gray-50 text-center w-160 h-80 border-dashed border-2 flex flex-col items-center justify-center">
                    {isRecording ? (
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <Mic className="w-12 h-12 text-red-500 animate-pulse" />
                            </div>
                            <p className="text-lg font-medium text-gray-700">正在录音...</p>
                        </div>
                    ) : (
                        !isCountingDown && (
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                                    <Mic className="w-12 h-12 text-gray-500" />
                                </div>
                                <Button onClick={startCountdown} className="mt-4">
                                    {countdown == 4 ? "开始录音" : countdown}
                                </Button>
                            </div>
                        )
                    )}
                    
                    <div className="absolute bottom-4 right-4 flex space-x-2 items-center">
                        <div className="bg-gray-200 p-2 rounded-full text-xs">
                            {new Date(recordingDuration * 1000).toISOString().slice(14, 19)}
                        </div>
                        <div className="text-xs">/</div>
                        <div className="bg-gray-200 p-2 rounded-full text-xs">
                            00:30
                        </div>
                    </div>
                </div>
                
                {audioUrl && (
                    <div className="flex justify-center items-center mt-2 gap-120">
                        <div className="flex flex-col">
                            <span className="font-bold">音频录制</span>
                            <span className="text-sm text-gray-500">
                                {new Date(recordingDuration * 1000).toISOString().slice(14, 19)}
                            </span>
                        </div>
                        <div className="flex space-x-10">
                            <CirclePlay 
                                className={`w-6 h-6 ${processing ? 'text-gray-400' : 'cursor-pointer'}`}
                                onClick={() => !processing && openPopup()}
                            >
                                播放
                            </CirclePlay>
                            <Trash 
                                className={`w-6 h-6 ${processing ? 'text-gray-400' : 'cursor-pointer'}`}
                                onClick={() => {
                                    if (!processing) {
                                        resetStates();
                                        setCountdown(4);
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
                
                {audioUrl && (
                    <div className="w-160 mx-auto bg-white rounded-lg shadow-md p-6 mt-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className={`flex items-center justify-between p-3 rounded-lg ${uploadComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-2">
                                        {uploadComplete ? 
                                            <CheckCircle className="w-4 h-4 text-green-500" /> :
                                            <FileIcon className="w-4 h-4 text-gray-400" />
                                        }
                                        <span className={`text-sm ${uploadComplete ? 'text-green-600' : 'text-gray-600'}`}>
                                            {isCloning ? '正在克隆声音...' : uploadComplete ? '声音克隆成功' : '音频文件'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {(audioSize / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                </div>
                                
                                {!uploadComplete && (
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${isCloning ? '100' : uploadProgress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-center items-center">
                    <Button
                        className="mt-8 flex justify-end mr-4"
                        style={{
                            display: isRecording ? "block" : "none",
                        }}
                        onClick={stopRecording} 
                        variant="destructive"
                        disabled={processing}
                    >
                        结束录音
                    </Button>
                </div>
            </div>
            
            {isPopupVisible && audioUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">音频预览</h3>
                            <X onClick={closePopup} className="cursor-pointer" />
                        </div>
                        <audio controls className="mt-4 w-80 h-20">
                            <source src={audioUrl} type={mediaRecorderRef.current?.mimeType || 'audio/webm'} />
                            您的浏览器不支持音频标签。
                        </audio>
                    </div>
                </div>
            )}
        </div>
    )
}