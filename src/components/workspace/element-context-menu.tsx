"use client"

import { useRef, useState, useEffect } from "react"
import { ZIndexControls } from "./z-index-controls"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ElementContextMenuProps {
  onBringToFront: () => void
  onSendToBack: () => void
  onBringForward: () => void
  onSendBackward: () => void
  disabled?: boolean
  children: React.ReactNode
}

export function ElementContextMenu({
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  disabled = false,
  children,
}: ElementContextMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Handle right-click on the element
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // Set the position of the context menu to the mouse coordinates
    setPosition({ x: e.clientX, y: e.clientY })
    setIsOpen(true)
  }

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isOpen])

  // Position the trigger element at the mouse coordinates
  useEffect(() => {
    if (triggerRef.current) {
      triggerRef.current.style.position = "fixed"
      triggerRef.current.style.left = `${position.x}px`
      triggerRef.current.style.top = `${position.y}px`
    }
  }, [position])

  return (
    <div onContextMenu={handleContextMenu} className="element-context-menu" data-export-exclude="true">
      {children}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div ref={triggerRef} className="w-0 h-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/80 backdrop-blur-sm rounded-md p-1 shadow-md">
          <ZIndexControls
            onBringToFront={onBringToFront}
            onSendToBack={onSendToBack}
            onBringForward={onBringForward}
            onSendBackward={onSendBackward}
            disabled={disabled}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}