"use client"

import { ChevronsUp, ChevronsDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { collectAllElements, findCurrentElementIndex } from "@/utils/layer-controls"
import { Scene, SelectedElementType } from "@/types/scene"

interface ZIndexControlsProps {
  onBringToFront: () => void
  onSendToBack: () => void
  onBringForward: () => void
  onSendBackward: () => void
  disabled?: boolean
  scenes?: Scene[]
  activeScene?: number
  selectedElement?: SelectedElementType | null
}

export function ZIndexControls({
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  disabled = false,
  scenes,
  activeScene = 0,
  selectedElement,
}: ZIndexControlsProps) {
  // 添加状态来跟踪元素的位置
  const [isAtTop, setIsAtTop] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)
  
  // 检查元素的位置
  useEffect(() => {
    if (!scenes || !selectedElement) {
      setIsAtTop(false)
      setIsAtBottom(false)
      return
    }
    
    const allElements = collectAllElements(scenes, activeScene)
    // 按 z-index 排序
    allElements.sort((a, b) => a.zIndex - b.zIndex)
    
    const currentIndex = findCurrentElementIndex(allElements, selectedElement)
    if (currentIndex === -1) {
      setIsAtTop(false)
      setIsAtBottom(false)
      return
    }
    
    // 检查是否在顶层或底层
    setIsAtTop(currentIndex === allElements.length - 1)
    setIsAtBottom(currentIndex === 0)
    
  }, [scenes, activeScene, selectedElement])
  
  return (
    <div className="flex flex-col space-y-1 p-1">
      <Button
        variant="ghost"
        className={`h-8 px-2 justify-start text-xs ${
          isAtTop || disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-100'
        }`}
        onClick={onBringToFront}
        disabled={disabled || isAtTop}
        title="Bring to Front"
      >
        <ArrowUp className="h-4 w-4 mr-2" />
        置于顶层
      </Button>
      <Button
        variant="ghost"
        className={`h-8 px-2 justify-start text-xs ${
          isAtBottom || disabled 
            ? 'text-gray-400 pointer-events-none' 
            : 'hover:bg-gray-100'
        }`}
        onClick={onSendToBack}
        disabled={disabled || isAtBottom}
        title="Send to Back"
      >
        <ArrowDown className={`h-4 w-4 mr-2 ${isAtBottom || disabled ? 'text-gray-400' : ''}`} />
        置于底层
      </Button>
      <Button
        variant="ghost"
        className={`h-8 px-2 justify-start text-xs ${
          isAtTop || disabled 
            ? 'text-gray-400 pointer-events-none' 
            : 'hover:bg-gray-100'
        }`}
        onClick={onBringForward}
        disabled={disabled || isAtTop}
        title="Bring Forward"
      >
        <ChevronsUp className={`h-4 w-4 mr-2 ${isAtTop || disabled ? 'text-gray-400' : ''}`} />
        上移一层
      </Button>
      <Button
        variant="ghost"
        className={`h-8 px-2 justify-start text-xs ${
          isAtBottom || disabled 
            ? 'text-gray-400 pointer-events-none' 
            : 'hover:bg-gray-100'
        }`}
        onClick={onSendBackward}
        disabled={disabled || isAtBottom}
        title="Send Backward"
      >
        <ChevronsDown className={`h-4 w-4 mr-2 ${isAtBottom || disabled ? 'text-gray-400' : ''}`} />
        下移一层
      </Button>
    </div>
  )
}