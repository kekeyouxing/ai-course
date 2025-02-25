"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import LoginModal from "./login-modal"

export default function LoginPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Button onClick={() => setIsModalOpen(true)} className="px-6 py-2">
                Open Login Modal
            </Button>
            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
        </div>
    )
}

