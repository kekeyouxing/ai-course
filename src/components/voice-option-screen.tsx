"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {CloudIcon as CloudMusic, Mic} from "lucide-react"
import UploadScreen from "./upload-screen"
import RecordingSetup from "./recording-setup"

export default function VoiceOptionScreen({onBack}: { onBack: () => void }) {
    const [selectedOption, setSelectedOption] = useState<"record" | "upload">("upload")
    const [showUpload, setShowUpload] = useState(false)
    const [showRecording, setShowRecording] = useState(false)

    if (showUpload) {
        return <UploadScreen onBack={() => setShowUpload(false)}/>
    }

    if (showRecording) {
        return <RecordingSetup onBack={() => setShowRecording(false)}/>
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex justify-between items-center p-6">
                <h1 className="text-xl font-medium text-gray-800">Clone your voice</h1>
                <Button variant="outline" className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50"
                        onClick={() => window.location.href = '/home'}>
                    Discard voice cloning
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex justify-center items-center px-4">
                <div className="bg-white rounded-lg shadow-sm w-full max-w-3xl p-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-medium text-gray-800">Choose an option</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Record option */}
                            <div
                                className={`p-6 bg-gray-50 rounded-lg cursor-pointer ${
                                    selectedOption === "record" ? "border-2 border-blue-500" : "border border-gray-200"
                                }`}
                                onClick={() => setSelectedOption("record")}
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 flex items-center justify-center">
                                        <Mic className="w-16 h-16 text-gray-400"/>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800">Record your voice</h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Read a script to clone your voice.
                                            <br/>A high-quality microphone is required.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Upload option */}
                            <div
                                className={`p-6 bg-gray-50 rounded-lg cursor-pointer ${
                                    selectedOption === "upload" ? "border-2 border-blue-500" : "border border-gray-200"
                                }`}
                                onClick={() => setSelectedOption("upload")}
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 flex items-center justify-center">
                                        <CloudMusic className="w-16 h-16 text-gray-400"/>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800">Upload a voiceover</h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Upload a good quality audio file
                                            <br/>
                                            of your voice.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" className="rounded-full border-gray-300 text-gray-700"
                                    onClick={onBack}>
                                Back
                            </Button>

                            <Button
                                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                onClick={() => {
                                    if (selectedOption === "upload") {
                                        setShowUpload(true)
                                    } else if (selectedOption === "record") {
                                        setShowRecording(true)
                                    }
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

