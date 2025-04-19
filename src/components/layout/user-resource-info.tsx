import { useEffect } from "react"
import { CreditCard, Zap, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserInfo } from "@/hooks/use-user-info"
import { formatRemainingTime, formatMembershipEnd, getMembershipTierName } from "@/api/user"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function UserResourceInfo({ 
  showButtons = true,
  setSubscriptionModalOpen = undefined,
  setVideoPackModalOpen = undefined
}: { 
  showButtons?: boolean,
  setSubscriptionModalOpen?: (open: boolean) => void,
  setVideoPackModalOpen?: (open: boolean) => void
}) {
  const { 
    userInfo, 
    loading, 
    fetchUserInfo, 
    isMember, 
    getMembershipInfo, 
    getResourceInfo 
  } = useUserInfo()

  useEffect(() => {
    fetchUserInfo()
  }, [fetchUserInfo])

  if (loading || !userInfo) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
        <div className="h-3 w-14 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const { tier, endDate, active } = getMembershipInfo()
  const { memberVideoSeconds, packageVideoSeconds, memberTextChars, packageTextChars } = getResourceInfo()
  const totalVideoSeconds = memberVideoSeconds + packageVideoSeconds
  const totalTextChars = memberTextChars + packageTextChars

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center gap-4">
        {/* 会员信息 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs">
                <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-medium">{getMembershipTierName(tier)}</span>
                {active && tier !== "Free" && (
                  <span className="text-gray-500">({formatMembershipEnd(endDate)})</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-semibold">会员状态: {active ? '有效' : '已过期'}</p>
                {active && tier !== "Free" && (
                  <p>到期时间: {new Date(endDate).toLocaleDateString()}</p>
                )}
                {showButtons && setSubscriptionModalOpen && (
                  <p className="text-blue-500 mt-1 cursor-pointer" 
                     onClick={() => setSubscriptionModalOpen(true)}>
                    点击升级会员
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 资源信息 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3.5 w-3.5 text-green-500" />
                <span className="font-medium">剩余时长: {formatRemainingTime(totalVideoSeconds)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p>会员额度: {formatRemainingTime(memberVideoSeconds)}</p>
                <p>视频包额度: {formatRemainingTime(packageVideoSeconds)}</p>
                {showButtons && setVideoPackModalOpen && (
                  <p className="text-yellow-500 mt-1 cursor-pointer" 
                     onClick={() => setVideoPackModalOpen(true)}>
                    点击购买视频包
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs">
                <FileText className="h-3.5 w-3.5 text-purple-500" />
                <span className="font-medium">文本额度: {totalTextChars.toLocaleString()}字</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p>会员额度: {memberTextChars.toLocaleString()}字</p>
                <p>视频包额度: {packageTextChars.toLocaleString()}字</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 按钮区域 */}
      {showButtons && (
        <div className="flex gap-2">
          {setSubscriptionModalOpen && (
            <Button 
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs bg-blue-50 text-blue-500 border-blue-100 flex items-center gap-1 rounded-full"
              onClick={() => setSubscriptionModalOpen(true)}
            >
              会员订阅
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </Button>
          )}
          {setVideoPackModalOpen && (
            <Button 
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs bg-yellow-50 text-yellow-500 border-yellow-100 flex items-center gap-1 rounded-full"
              onClick={() => setVideoPackModalOpen(true)}
            >
              充值视频包
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 flex items-center justify-center">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </Button>
          )}
        </div>
      )}
    </div>
  )
} 