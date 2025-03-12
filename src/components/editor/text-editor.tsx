""

import type React from "react"
import {useEffect, useState} from "react"

interface TextEditorProps {
    content: string
    onContentChange: (content: string) => void
}

export function TextEditor({content, onContentChange}: TextEditorProps) {
    const [localContent, setLocalContent] = useState(content)

    useEffect(() => {
        setLocalContent(content)
    }, [content])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value
        setLocalContent(newContent)
        onContentChange(newContent)
    }

    return (
        <textarea
            className="w-full h-full p-4 resize-none focus:outline-none"
            value={localContent}
            onChange={handleChange}
            placeholder="Enter your slide content here..."
        />
    )
}

