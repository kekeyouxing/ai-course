"use client"

import { useState } from "react"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"

type TextAlignment = "left" | "center" | "right"

interface TextAlignmentSelectorProps {
  defaultAlignment?: TextAlignment
  onChange?: (alignment: TextAlignment) => void
  className?: string
}

export function TextAlignmentSelector({
  defaultAlignment = "left",
  onChange,
  className = "",
}: TextAlignmentSelectorProps) {
  const [activeAlignment, setActiveAlignment] = useState<TextAlignment>(defaultAlignment)

  const handleAlignmentChange = (alignment: TextAlignment) => {
    setActiveAlignment(alignment)
    if (onChange) {
      onChange(alignment)
    }
  }

  return (
    <div className={`flex bg-gray-100 rounded-md p-1 ${className}`}>
      <button
        type="button"
        onClick={() => handleAlignmentChange("left")}
        className={`flex items-center justify-center h-9 w-9 rounded-md transition-colors ${
          activeAlignment === "left" ? "bg-white shadow-sm" : "hover:bg-gray-200"
        }`}
        aria-pressed={activeAlignment === "left"}
        aria-label="Align text left"
      >
        <AlignLeft className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => handleAlignmentChange("center")}
        className={`flex items-center justify-center h-9 w-9 rounded-md transition-colors ${
          activeAlignment === "center" ? "bg-white shadow-sm" : "hover:bg-gray-200"
        }`}
        aria-pressed={activeAlignment === "center"}
        aria-label="Align text center"
      >
        <AlignCenter className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => handleAlignmentChange("right")}
        className={`flex items-center justify-center h-9 w-9 rounded-md transition-colors ${
          activeAlignment === "right" ? "bg-white shadow-sm" : "hover:bg-gray-200"
        }`}
        aria-pressed={activeAlignment === "right"}
        aria-label="Align text right"
      >
        <AlignRight className="h-4 w-4" />
      </button>
    </div>
  )
}

