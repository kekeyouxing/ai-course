"use client"

import {useRef, useState} from "react"
import {Button} from "@/components/ui/button"
import {CirclePlay, Trash, X} from "lucide-react"
import {toast} from "sonner";

export function VideoRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const recordedChunks = useRef<Blob[]>([]);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [countdown, setCountdown] = useState(4);
    const countdownIntervalRef = useRef<NodeJS.Timeout>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
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
    // 开始倒计时
    const startCountdown = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {width: 1280, height: 720},
                audio: true
            });

            // 显示预览
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
                videoPreviewRef.current.play().catch(console.error);
            }
            // 设置预览视频源
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
                videoPreviewRef.current.play().catch(error => {
                    console.error("视频自动播放失败:", error);
                });
            }
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
            toast.error("无法访问摄像头/麦克风，请检查权限设置");
        }
    };
    const startRecording = async (stream: MediaStream) => {
        try {
            setIsCountingDown(true);
            // 初始化媒体录制器
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "video/mp4; codecs=vp9"
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

                const duration = Math.floor((Date.now() - startTimeRef.current!) / 1000);
                if (duration < 10) {
                    console.info("录制时长不足 10 秒");
                    toast.error("录制时长不足 10 秒，请重新录制");
                    // 清理资源
                    if (videoPreviewRef.current) {
                        videoPreviewRef.current.srcObject = null;
                    }
                    stream.getTracks().forEach(track => track.stop());
                    clearInterval(intervalRef.current!);
                    setIsRecording(false);
                    setRecordingDuration(0)
                    return;
                }
                const videoBlob = new Blob(recordedChunks.current, {
                    type: "video/mp4"
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
    return (
        <div className="h-full flex flex-col justify-between p-6 bg-gray-100">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">Video Recording</h2>
            <div className="flex-grow flex flex-col justify-center items-center space-y-6">
                <div
                    className="relative space-y-4 rounded-lg bg-gray-50 text-center w-160 h-80 border-dashed border-2 flex flex-col items-center justify-center">
                    <video
                        ref={videoPreviewRef}
                        autoPlay
                        style={{
                            display: isRecording ? "block" : "none",
                            transform: "scaleX(-1)" // 前置摄像头镜像翻转
                        }}
                    />
                    {!isCountingDown && (
                        <Button onClick={startCountdown}>
                            {countdown == 4 ? "开始录制" : countdown}
                        </Button>
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
                {videoUrl && (
                    <div className="flex  justify-center items-center mt-4 gap-120">
                        <div className="flex flex-col">
                            <span className="font-bold">视频标题</span>
                            <span
                                className="text-sm text-gray-500">{new Date(recordingDuration * 1000).toISOString().slice(14, 19)}</span>
                        </div>
                        <div className="flex space-x-10">
                            <CirclePlay className="w-6 h-6 cursor-pointer"
                                        onClick={() => {
                                            openPopup();
                                        }
                                        }>播放</CirclePlay>
                            <Trash className="w-6 h-6 cursor-pointer" onClick={() => setVideoUrl(null)}></Trash>
                        </div>
                    </div>
                )}
                <div className="flex justify-center items-center">
                    <Button
                        className="mt-8 flex justify-end mr-4"
                        style={{
                            display: isRecording ? "block" : "none",
                        }}
                        onClick={stopRecording} variant="destructive">
                        结束录制
                    </Button>
                </div>
            </div>
            {isPopupVisible && videoUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg">
                        <X onClick={closePopup} className="top-2 right-2 cursor-pointer"/>
                        <video controls className="mt-4 w-192 h-112">
                            <source src={videoUrl} type="video/mp4"/>
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}
        </div>
    )
}

