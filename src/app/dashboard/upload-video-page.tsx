import {  useState, useRef } from "react";
import { Button } from "@/components/ui/button"; // 从 Shadcn UI 引入按钮组件

import {
    VolumeX,
    UploadCloud,
    ThumbsUp,
    AlertTriangle,
    ArrowLeft,
} from "lucide-react"// 引入图标

export default function UploadVideoPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [showRecordingLabel, setShowRecordingLabel] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const recordedChunks = useRef<Blob[]>([]);

    // 处理文件上传
    const handleFileUpload = () => {
        // const file = event.target.files[0];
        // if (file && file.size <= 10 * 1024 * 1024) { // 限制上传最大文件为 10MB
        //     setAudioFile(file);
        //     setAudioDuration(0);
        // } else {
        //     alert("文件大小超过限制，请上传小于10MB的文件。");
        // }
    };

    const startRecording = async () => {
        try {
            // 请求摄像头权限并获取视频流
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user" // 使用前置摄像头
                }
            });

            // 设置预览视频源
            if (videoPreviewRef.current) {
                console.log("Video element found:", videoPreviewRef.current);
                videoPreviewRef.current.srcObject = stream;
                videoPreviewRef.current.play().catch(error => {
                    console.error("视频自动播放失败:", error);
                });
            }else {
                console.log("Video element not found");
            }

            // 初始化媒体录制器
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "video/webm; codecs=vp9"
            });

            mediaRecorderRef.current = mediaRecorder;
            recordedChunks.current = [];

            // 录制开始事件
            mediaRecorder.onstart = () => {
                setIsRecording(true);
                setVideoUrl(null); // 清除之前的录制结果
                startTimeRef.current = Date.now();
                intervalRef.current = setInterval(() => {
                    setRecordingDuration(
                        Math.floor((Date.now() - startTimeRef.current!) / 1000)
                    );
                }, 1000);
            };

            // 数据可用事件
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.current.push(event.data);
                }
            };

            // 录制结束事件
            mediaRecorder.onstop = () => {
                const videoBlob = new Blob(recordedChunks.current, {
                    type: "video/webm"
                });
                const url = URL.createObjectURL(videoBlob);
                setVideoUrl(url);

                // 清理资源
                if (videoPreviewRef.current) {
                    videoPreviewRef.current.srcObject = null;
                }
                stream.getTracks().forEach(track => track.stop());
                clearInterval(intervalRef.current!);
                setIsRecording(false);
            };

            // 开始录制（每100ms收集一次数据）
            mediaRecorder.start(100);
        } catch (error) {
            console.error("启动录制失败:", error);
            alert("无法访问摄像头，请检查权限设置");
        }
    };
    // 停止录制函数
    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };


    return (
        <div className="flex">
            {/* 主内容 */}
            <div className="flex-1 p-24">
                <div className="mt-6 flex flex-wrap items-center justify-center">
                    <div className="flex items-start mx-4 flex-col w-48">
                        <VolumeX className="w-6 h-6 mb-2"/>
                        <span className="font-bold">在安静环境下录制</span>
                        <span className="text-sm text-gray-500 block text-justify">避免在嘈杂的环境附近录制。以确保录制的视频更加清晰、纯净，避免影响音频质量。
                        </span>
                    </div>
                    <div className="flex items-start mx-4 flex-col w-48">
                        <ThumbsUp className="w-6 h-6 mb-2"/>
                        <span className="font-bold">检查设备良好</span>
                        <span className="text-sm text-gray-500 block text-justify">确保麦克风，摄像头正常工作，镜头清洁、无遮挡，且对焦准确，避免画面模糊。
                        </span>
                    </div>
                    <div className="flex items-start mx-4 flex-col w-48">
                        <AlertTriangle className="w-6 h-6 mb-2"/>
                        <span className="font-bold">如果设备异常</span>
                        <span className="text-sm text-gray-500 block text-justify">无法检测到设备，您可以选择拖拽文件或点击上传按钮重新尝试上传。
                        </span>
                    </div>
                </div>
                {/* 上传或录音部分 */}
                <div className="mt-8">
                    <div className="flex justify-center">
                        {!showRecordingLabel ? (
                            <label htmlFor="file-upload"
                                   className="space-y-4 rounded-lg bg-gray-50 cursor-pointer text-center w-160 h-80 border-dashed border-2 flex flex-col items-center justify-center">
                                <UploadCloud className="w-8 h-8 mb-2"/>
                                <p>点击或者拖拽上传视频</p>
                                <p className="text-xs text-gray-500">支持的视频格式：MP4、mov、flv等，单个文件最大50MB</p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <Button variant="outline" onClick={() => setShowRecordingLabel(true)}>
                                    录制视频
                                </Button>
                            </label>
                        ) : (
                            <div
                                className="relative space-y-4 rounded-lg bg-gray-50 text-center w-160 h-80 border-dashed border-2 flex flex-col items-center justify-center">
                                <Button variant="outline"
                                        className="absolute top-2 left-2 p-2 flex items-center"
                                        onClick={() => {
                                            setShowRecordingLabel(false);
                                        }}
                                >
                                    <ArrowLeft className="w-4 h-4"/>返回
                                </Button>
                                {!isRecording && (
                                    <Button variant="outline" onClick={startRecording}>
                                        开始录制
                                    </Button>
                                )}
                                <video
                                    ref={videoPreviewRef}
                                    autoPlay
                                    style={{
                                        display: isRecording ? "block" : "none",
                                        transform: "scaleX(-1)" // 前置摄像头镜像翻转
                                    }}
                                />

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
                        )}
                    </div>
                </div>

                {/*<Button*/}
                {/*    className="absolute bottom-2 left-2 flex items-center"*/}
                {/*    style={{*/}
                {/*        display: isRecording ? "block" : "none",*/}
                {/*    }}*/}
                {/*    onClick={stopRecording} variant="destructive">*/}
                {/*    结束录制*/}
                {/*</Button>*/}
                {/*<div className="mt-8 flex justify-end pr-48">*/}
                {/*    <Button>下一步</Button>*/}
                {/*</div>*/}
                <div className="flex justify-end items-center">
                    <Button
                        className="mt-8 flex justify-end mr-4"
                        style={{
                            display: isRecording ? "block" : "none",
                        }}
                        onClick={stopRecording} variant="destructive">
                        结束录制
                    </Button>
                    <div className="mt-8 flex justify-end pr-48">
                        <Button>下一步</Button>
                    </div>
                </div>
                <div>
                    {/* 录制回放视频（录制完成后显示） */}
                    {videoUrl && (
                        <video controls className="mt-4 w-full h-full">
                            <source src={videoUrl} type="video/webm"/>
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>

            </div>
        </div>
    );
}
