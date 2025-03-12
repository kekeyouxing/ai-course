"use client"

import { Clock, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  value: number
  onChange: (value: number) => void
  onInsert: () => void
  isOpen: boolean
  onToggle: () => void
}

export default function TimePicker({
  value,
  onChange,
  onInsert,
  isOpen,
  onToggle
}: TimePickerProps) {
  const increaseTime = () => {
    if (value < 99) {
      onChange(value + 1)
    }
  }

  const decreaseTime = () => {
    if (value > 1) {
      onChange(value - 1)
    }
  }

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 99) {
      onChange(newValue)
    }
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="rounded-full hover:bg-primary/10 h-8 w-8 p-0"
        onClick={onToggle}
      >
        <Clock className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute bottom-full mb-2 bg-white border rounded-lg shadow-lg p-3 w-36">
          <div className="text-xs text-gray-500 mb-2">插入暂停时间标记</div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Input
                type="number"
                min={1}
                max={99}
                value={value}
                onChange={handleTimeInputChange}
                className="w-20 h-7 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="ml-1 text-sm">秒</span>
            </div>
            <div className="flex flex-col">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={increaseTime}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={decreaseTime}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            size="sm" 
            className="w-full text-xs" 
            onClick={onInsert}
          >
            插入暂停标记
          </Button>
        </div>
      )}
    </div>
  )
}