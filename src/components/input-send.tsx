"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Send} from "lucide-react"

interface InputSendProps {
    onSend: (message: string) => void
}

export function InputSend({onSend}: InputSendProps) {
    const [message, setMessage] = useState("")

    const handleSend = () => {
        if (message.trim()) {
            onSend(message)
            setMessage("")
        }
    }

    return (
        <div className="flex space-x-2 p-4 border-t">
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow"
            />
            <Button onClick={handleSend}>
                <Send className="h-4 w-4"/>
            </Button>
        </div>
    )
}

