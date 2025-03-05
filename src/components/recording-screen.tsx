"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Mic} from "lucide-react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"

const SAMPLE_SCRIPT = `In the era of digital transformation, Artificial Intelligence, or AI, emerges as a pivotal tool in boosting productivity. It's not just a technological leap; it's a revolution in how we work, analyze, and innovate.

AI's power lies in its ability to swiftly process and analyze large data sets, offering businesses crucial insights and trends. This leads to informed, efficient decision-making, saving time and enhancing strategic planning. In sectors like healthcare, finance, and retail, AI-driven analytics are transforming operations and improving customer experiences.

Moreover, AI facilitates automation of routine tasks, allowing professionals to focus on more complex, creative aspects of their work. This shift not only increases efficiency but also opens new avenues for innovation and problem-solving.

The impact of AI extends beyond mere automation. It's reshaping entire industries, from personalized healthcare solutions to smart manufacturing processes. As we advance, the integration of AI continues to unlock new possibilities and redefine the boundaries of what's possible in the digital age.`

export default function RecordingScreen({onBack}: { onBack: () => void }) {
    const [selectedLanguage, setSelectedLanguage] = useState("english")
    const [isRecording, setIsRecording] = useState(false)

    const handleStartRecording = async () => {
        try {
            setIsRecording(true)
            // Implement recording logic here
        } catch (error) {
            console.error("Recording failed:", error)
            setIsRecording(false)
        }
    }

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
                <div className="bg-white rounded-lg shadow-sm w-full max-w-4xl p-8">
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-blue-600 text-sm">Recording part 2</p>
                                <h2 className="text-2xl font-medium text-gray-800">Clone your voice</h2>
                                <p className="text-gray-600">
                                    Select the preferred language for your script, and press the microphone button to
                                    read the sentences
                                    aloud.
                                </p>
                            </div>

                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                <SelectTrigger className="w-[180px] border-gray-300">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">🇬🇧</span>
                                        <SelectValue placeholder="Select language"/>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="english">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">🇬🇧</span>
                                            English
                                        </div>
                                    </SelectItem>
                                    {/* Add more language options as needed */}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Script Section */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-medium text-gray-800">Script</h3>
                            <div className="bg-gray-50 rounded-lg p-6 max-h-[400px] overflow-y-auto">
                                <div className="prose prose-gray">
                                    {SAMPLE_SCRIPT.split("\n\n").map((paragraph, index) => (
                                        <p key={index} className="mb-4 text-gray-600 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center pt-4">
                            <Button variant="outline" className="rounded-full border-gray-300 text-gray-700"
                                    onClick={onBack}>
                                Back
                            </Button>

                            <Button
                                className={`rounded-full px-6 flex items-center gap-2 ${
                                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-gray-900 hover:bg-gray-800"
                                } text-white`}
                                onClick={handleStartRecording}
                            >
                                <Mic className="w-4 h-4"/>
                                {isRecording ? "Recording..." : "Start recording"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

