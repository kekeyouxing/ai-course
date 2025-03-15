"use client"

import { ChevronsUp, ChevronsDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ZIndexControlsProps {
  onBringToFront: () => void
  onSendToBack: () => void
  onBringForward: () => void
  onSendBackward: () => void
  disabled?: boolean
}

export function ZIndexControls({
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  disabled = false,
}: ZIndexControlsProps) {
  return (
    <div className="flex flex-col space-y-1 p-1">
      <Button
        variant="ghost"
        className="h-8 px-2 justify-start text-xs"
        onClick={onBringToFront}
        disabled={disabled}
        title="Bring to Front"
      >
        <ArrowUp className="h-4 w-4 mr-2" />
        置于顶层
      </Button>
      <Button
        variant="ghost"
        className="h-8 px-2 justify-start text-xs"
        onClick={onBringForward}
        disabled={disabled}
        title="Bring Forward"
      >
        <ChevronsUp className="h-4 w-4 mr-2" />
        上移一层
      </Button>
      <Button
        variant="ghost"
        className="h-8 px-2 justify-start text-xs"
        onClick={onSendBackward}
        disabled={disabled}
        title="Send Backward"
      >
        <ChevronsDown className="h-4 w-4 mr-2" />
        下移一层
      </Button>
      <Button
        variant="ghost"
        className="h-8 px-2 justify-start text-xs"
        onClick={onSendToBack}
        disabled={disabled}
        title="Send to Back"
      >
        <ArrowDown className="h-4 w-4 mr-2" />
        置于底层
      </Button>
    </div>
  )
}