import {ChevronDown} from "lucide-react"

export function ScriptContent() {
    return (
        <div className="p-4">
            <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center mr-2">
                    <span className="text-purple-800">👤</span>
                </div>
                <button className="flex items-center text-sm">
                    <span>US - Leesa</span>
                    <ChevronDown className="h-4 w-4 ml-1"/>
                </button>
            </div>
            <textarea className="w-full h-64 p-2 border rounded" placeholder="Enter your script here..."/>
        </div>
    )
}

