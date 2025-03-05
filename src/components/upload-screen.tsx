"use client"

import {useCallback, useState} from "react"
import {Button} from "@/components/ui/button"
import {FileIcon} from "lucide-react"
import {useDropzone} from "react-dropzone"

export default function UploadScreen({onBack}: { onBack: () => void }) {
    const [files, setFiles] = useState<File[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Filter for audio files and size limit
        const validFiles = acceptedFiles.filter((file) => {
            const isAudio = file.type.startsWith("audio/")
            const isUnderSize = file.size <= 10 * 1024 * 1024 // 10MB
            return isAudio && isUnderSize
        })

        setFiles((prev) => [...prev, ...validFiles])
    }, [])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {
            "audio/*": [".mp3", ".wav", ".m4a", ".aac"],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
    })

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center p-6">
                <h1 className="text-xl font-medium text-gray-800">Clone your voice</h1>
                <Button variant="outline" className="rounded-full text-gray-700 border-gray-300 hover:bg-gray-50">
                    Discard voice cloning
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex justify-center items-center px-4">
                <div className="bg-white rounded-lg shadow-sm w-full max-w-2xl p-8">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-medium text-gray-800">Upload voice samples</h2>

                        {/* Instructions */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-800">How to clone your voice</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Cloning your voice requires a sample. Sample quality is more important than quantity.
                                Noisy samples may
                                result in bad voices. Providing about 5 minutes of audio gives enough to process your
                                voice. You can
                                expect your cloned voice to be ready in 5-10 minutes.
                            </p>
                        </div>

                        {/* Upload Area */}
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
                            <FileIcon className="w-8 h-8 text-gray-400 mb-4"/>
                            <div className="text-center">
                                <p className="text-blue-600 font-medium">Click to upload a file</p>
                                <p className="text-gray-600">or drag and drop</p>
                                <p className="text-sm text-gray-500 mt-2">Audio files, up to 10Mb each</p>
                            </div>
                        </div>

                        {/* Uploaded Files List */}
                        {files.length > 0 && (
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <div key={index}
                                         className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <FileIcon className="w-4 h-4 text-gray-400"/>
                                            <span className="text-sm text-gray-600">{file.name}</span>
                                        </div>
                                        <span
                                            className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" className="rounded-full border-gray-300 text-gray-700"
                                    onClick={onBack}>
                                Back
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

