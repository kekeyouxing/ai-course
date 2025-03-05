"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Mic} from "lucide-react"

export function VideoRecorder() {
    const [isRecording, setIsRecording] = useState(false)

    const handleStartRecording = () => {
        setIsRecording(!isRecording)
        // Implement actual recording logic here
    }

    return (
        <div className="h-full flex flex-col justify-between p-6 bg-gray-100">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">Video Recording</h2>
            <div className="flex-grow flex flex-col justify-center items-center space-y-6">
                <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Video preview will appear here</p>
                </div>
                <Button
                    className={`rounded-full px-6 flex items-center gap-2 ${
                        isRecording ? "bg-red-500 hover:bg-red-600" : "bg-gray-900 hover:bg-gray-800"
                    } text-white`}
                    onClick={handleStartRecording}
                >
                    <Mic className="w-4 h-4"/>
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
            </div>
        </div>
    )
}

