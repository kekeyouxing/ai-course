"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Check, Lock, Mic, Settings} from "lucide-react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import RecordingScreen from "./RecordingScreen" // Import RecordingScreen

type Step = "permission" | "setup"

interface StepState {
    completed: boolean
    enabled: boolean
}

export default function RecordingSetup({onBack}: { onBack: () => void }) {
    const [steps, setSteps] = useState<Record<Step, StepState>>({
        permission: {completed: false, enabled: true},
        setup: {completed: false, enabled: false},
    })

    const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt")
    const [selectedMicrophone, setSelectedMicrophone] = useState<string>("")
    const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceInfo[]>([])
    const [showRecording, setShowRecording] = useState(false)

    const requestMicrophonePermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true}) // 请求麦克风和摄像头权限
            stream.getTracks().forEach((track) => track.stop()) // 清理
            setPermissionStatus("granted")
            setSteps((prev) => ({
                ...prev,
                permission: {completed: true, enabled: true},
                setup: {completed: false, enabled: true},
            }))

            // 获取可用的麦克风
            const devices = await navigator.mediaDevices.enumerateDevices()
            const microphones = devices.filter((device) => device.kind === "audioinput")
            setAvailableMicrophones(microphones)
            if (microphones.length > 0) {
                setSelectedMicrophone(microphones[0].deviceId)
            }
        } catch (error) {
            setPermissionStatus("denied")
            console.error("麦克风或摄像头权限被拒绝:", error)
        }
    }

    // Check initial permission status
    useEffect(() => {
        const checkPermissions = async () => {
            const micPermission = await navigator.permissions.query({name: "microphone" as PermissionName});
            const camPermission = await navigator.permissions.query({name: "camera" as PermissionName});

            const micGranted = micPermission.state === "granted";
            const camGranted = camPermission.state === "granted";

            setPermissionStatus(micPermission.state as "prompt" | "granted" | "denied");

            if (micGranted && camGranted) {
                setSteps((prev) => ({
                    ...prev,
                    permission: {completed: true, enabled: true},
                    setup: {completed: false, enabled: true},
                }));
                // Get available microphones
                const devices = await navigator.mediaDevices.enumerateDevices();
                const microphones = devices.filter((device) => device.kind === "audioinput");
                setAvailableMicrophones(microphones);
                if (microphones.length > 0) {
                    setSelectedMicrophone(microphones[0].deviceId);
                }
            }
        };

        checkPermissions();
    }, []);

    const handleSetupComplete = () => {
        setSteps((prev) => ({
            ...prev,
            setup: {completed: true, enabled: true},
        }))
    }

    if (showRecording) {
        return <RecordingScreen onBack={() => setShowRecording(false)}/>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Instructions */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-medium text-gray-800">Checking requirements</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    By following these instructions, you&apos;ll be able to record a high-quality
                                    version of your cloned
                                    voice.
                                </p>
                                <p>
                                    Schedule a time to record when you won&apos;t be interrupted or distracted. Allow
                                    enough time to
                                    record several takes if necessary.
                                </p>
                                <p>The recording process will take about 5 mins.</p>
                            </div>
                        </div>

                        {/* Right Column - Steps */}
                        <div className="space-y-4">
                            {/* Permission Step */}
                            <div
                                className={`rounded-lg border p-4 ${
                                    steps.permission.completed ? "bg-green-50 border-green-200" : "bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Mic
                                            className={`w-5 h-5 ${steps.permission.completed ? "text-green-600" : "text-gray-600"}`}/>
                                        <h3 className="font-medium">Give permission</h3>
                                    </div>
                                    {!steps.permission.completed ? (
                                        <Button
                                            onClick={requestMicrophonePermission}
                                            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                        >
                                            Start
                                        </Button>
                                    ) : (
                                        <Check className="w-5 h-5 text-green-600"/>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">Allow your browser to access microphone and
                                    audio</p>
                                <p className="text-xs text-gray-500 mt-1">Click start and give permission in your
                                    browser.</p>
                            </div>

                            {/* Setup Step */}
                            <div
                                className={`rounded-lg border p-4 ${
                                    steps.setup.completed
                                        ? "bg-green-50 border-green-200"
                                        : steps.setup.enabled
                                            ? "bg-gray-50"
                                            : "opacity-50"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Settings
                                            className={`w-5 h-5 ${steps.setup.completed ? "text-green-600" : "text-gray-600"}`}/>
                                        <h3 className="font-medium">Audio setup</h3>
                                    </div>
                                    {steps.setup.completed ? (
                                        <Check className="w-5 h-5 text-green-600"/>
                                    ) : !steps.setup.enabled ? (
                                        <Lock className="w-5 h-5 text-gray-400"/>
                                    ) : null}
                                </div>

                                {steps.setup.enabled && !steps.setup.completed && (
                                    <div className="mt-4 space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-800">Background noise check</h4>
                                            <p className="text-sm text-gray-600">
                                                Choose a quiet and distraction-free recording area. Avoid recording in
                                                places with a lot of
                                                background noise, such as busy streets or near construction sites.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Select
                                                microphone</label>
                                            <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a microphone"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableMicrophones.map((device) => (
                                                        <SelectItem key={device.deviceId} value={device.deviceId}>
                                                            {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                onClick={handleSetupComplete}
                                                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        <Button variant="outline" className="rounded-full border-gray-300 text-gray-700"
                                onClick={onBack}>
                            Back
                        </Button>
                        {/* Final Next Button - Show when all steps are completed */}
                        {Object.values(steps).every((step) => step.completed) && (
                            <div className="flex justify-end">
                                <Button
                                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                                    onClick={() => {
                                        // Navigate to recording screen
                                        setShowRecording(true)
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

