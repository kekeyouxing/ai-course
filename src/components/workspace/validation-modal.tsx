"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Loader2, Info, Star, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ValidationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  errorMessages: string[]
  hasErrors: boolean
  onConfirm: () => void
  isGenerating?: boolean
}

export default function ValidationModal({
  open,
  onOpenChange,
  errorMessages,
  hasErrors,
  onConfirm,
  isGenerating = false
}: ValidationModalProps) {
  const [isLoading, setIsLoading] = useState(true)

  // 模拟加载效果 - 仅用于初始检查
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [open])

  // 合并状态进行显示 - 初始检查中或者生成中都显示加载状态
  const isInLoadingState = isLoading || isGenerating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-medium">
            {isInLoadingState ? (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            ) : hasErrors ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {isLoading ? "检查中..." : isGenerating ? "生成中..." : hasErrors ? "生成检查失败" : "生成检查通过"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <AnimatePresence>
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* 错误信息区域 */}
                {hasErrors && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">以下问题需要解决:</p>
                    <div className="bg-red-50 p-3 rounded border border-red-100">
                      <ul className="space-y-2">
                        {errorMessages.map((error, index) => (
                          <li 
                            key={index} 
                            className="text-sm text-red-600 flex items-start gap-2"
                          >
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 将警告提示区域改为温馨提示 - 所有情况下都显示 */}
                <div className="space-y-3">
                  {!hasErrors && (
                    <div className="p-3 bg-green-50 rounded border border-green-100">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        视频检查已通过，可以开始生成
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 rounded border border-blue-100">
                    <p className="text-sm text-blue-700 flex items-center gap-2 font-medium">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      温馨提示
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li className="text-sm text-blue-600 flex items-start gap-2">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>请先预览视频内容,确认无误后再生成。视频生成将消耗您的账户余额。</span>
                      </li>
                      <li className="text-sm text-blue-600 flex items-start gap-2">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>视频渲染需要一定时间，根据内容复杂度可能需要十几分钟，请耐心等待。</span>
                      </li>
                      <li className="text-sm text-blue-600 flex items-start gap-2">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          生成完成后，您可以前往
                          <a
                            href="/app/projects"
                            className="mx-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-medium hover:bg-blue-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChange(false);
                            }}
                          >
                            项目列表
                          </a>
                          查看、下载或分享您的成品视频。
                        </span>
                      </li>
                      <li className="text-sm text-blue-600 flex items-start gap-2">
                        <Star className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          需要更高质量的定制视频？我们提供专业的一对一服务
                          <a
                            href="/contact"
                            className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-medium hover:bg-blue-200 inline-flex items-center gap-1 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChange(false);
                            }}
                          >
                            立即咨询
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            onClick={onConfirm}
            disabled={hasErrors || isInLoadingState}
            className={`${
              isInLoadingState ? "bg-blue-400" :
              hasErrors ? "bg-gray-300 cursor-not-allowed" :
              "bg-black hover:bg-gray-800"
            }`}
          >
            {isInLoadingState ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? "生成中..." : "开始生成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 