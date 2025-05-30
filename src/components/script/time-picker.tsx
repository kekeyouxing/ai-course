"use client"

import { useState, useEffect } from "react"
import { Clock, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  // 添加一个内部状态来跟踪输入框的值
  const [inputValue, setInputValue] = useState<string>(value.toString());

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
    const newInputValue = e.target.value;
    setInputValue(newInputValue);
    
    // 解析输入值
    const newValue = parseInt(newInputValue);
    
    // 处理有效数字的情况
    if (!isNaN(newValue)) {
      // 如果超过99，设置为99
      if (newValue > 99) {
        onChange(99);
        setInputValue("99");
      } 
      // 如果小于1，设置为1
      else if (newValue < 1) {
        onChange(1);
        setInputValue("1");
      } 
      // 在有效范围内
      else {
        onChange(newValue);
      }
    }
  }
  
  // 处理输入框失去焦点的情况
  const handleBlur = () => {
    // 如果输入为空或无效，恢复为当前有效值
    if (inputValue === '' || isNaN(parseInt(inputValue))) {
      setInputValue(value.toString());
    }
  }

  // 确保内部状态与外部值同步
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full hover:bg-primary/10 h-8 w-8 p-0"
              onClick={onToggle}
            >
              <Clock className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>插入暂停时间标记</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {isOpen && (
        <div className="absolute bottom-full mb-2 bg-white border rounded-lg shadow-lg p-3 w-36">
          <div className="text-xs text-gray-500 mb-2">插入暂停时间标记</div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleTimeInputChange}
                onBlur={handleBlur}
                className="w-20 h-7 text-center"
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