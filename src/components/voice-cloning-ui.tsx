"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {UserIcon as Male, UserIcon as Female} from "lucide-react"
import VoiceOptionScreen from "./voice-option-screen"

export default function VoiceCloningUI() {
    const [voiceName, setVoiceName] = useState("")
    const [gender, setGender] = useState<"male" | "female">("male")
    const [currentScreen, setCurrentScreen] = useState<"naming" | "options">("naming")

    const handleCreateVoice = () => {
        setCurrentScreen("options")
    }

    const handleBack = () => {
        setCurrentScreen("naming")
    }

    if (currentScreen === "options") {
        return <VoiceOptionScreen onBack={handleBack}/>
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
                <div className="bg-white rounded-lg shadow-sm w-full max-w-md p-8">
                    <div className="space-y-6">
                        {/* Voice Name Section */}
                        <div className="space-y-2">
                            <h2 className="text-lg font-medium text-gray-800">Name custom voice</h2>
                            <p className="text-sm text-gray-500">Name custom voice</p>

                            <Input
                                value={voiceName}
                                onChange={(e) => setVoiceName(e.target.value)}
                                className="border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                            />
                        </div>

                        {/* Gender Selection */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-700">Choose voice gender</h3>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setGender("male")}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm ${
                                        gender === "male" ? "bg-gray-200 text-gray-800" : "bg-white text-gray-500 border border-gray-200"
                                    }`}
                                >
                                    <Male className="w-4 h-4"/>
                                    Male
                                </button>

                                <button
                                    onClick={() => setGender("female")}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm ${
                                        gender === "female" ? "bg-gray-200 text-gray-800" : "bg-white text-gray-500 border border-gray-200"
                                    }`}
                                >
                                    <Female className="w-4 h-4"/>
                                    Female
                                </button>
                            </div>
                        </div>

                        {/* Create Button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                onClick={handleCreateVoice}
                            >
                                Create my cloned voice
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

