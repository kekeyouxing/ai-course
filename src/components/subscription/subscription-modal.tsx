"use client"

import { useState, useEffect, useRef } from "react"
import { Check, X, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  getMembershipFeatures, 
  convertFeaturesToDisplay, 
  TierDisplay, 
  MembershipTier,
  requestMembershipPayment, 
  checkPaymentStatus
} from "@/api/membership"
import { OrderStatus } from "@/api/orders"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

interface SubscriptionModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showActionButton?: boolean;
  onSubscriptionSuccess?: () => void; // 支付成功后的回调
}

export default function SubscriptionModal({ 
  open, 
  onOpenChange, 
  showActionButton = true,
  onSubscriptionSuccess 
}: SubscriptionModalProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [tiers, setTiers] = useState<TierDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentQRCode, setPaymentQRCode] = useState<string | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<OrderStatus | null>(null)
  
  // 用于存储轮询定时器的ref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 获取会员等级数据
  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        setLoading(true)
        const features = await getMembershipFeatures()
        // 转换后端数据为前端显示格式
        const displayTiers = convertFeaturesToDisplay(features)
        // 不再排除免费会员
        setTiers(displayTiers)
      } catch (error) {
        console.error("获取会员数据失败:", error)
        toast.error("获取会员数据失败，请稍后再试")
      } finally {
        setLoading(false)
      }
    }

    fetchMembershipData()
  }, [])
  
  // 清理轮询定时器
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [])
  
  // 监听payment status变化
  useEffect(() => {
    if (paymentStatus === OrderStatus.SUCCESS) {
      handlePaymentSuccess();
    }
  }, [paymentStatus, onOpenChange])
  
  // 处理支付成功
  const handlePaymentSuccess = () => {
    // 停止轮询
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    // 显示成功消息
    toast.success("支付成功！您的会员已激活")
    
    // 延迟关闭弹窗，让用户看到成功状态
    setTimeout(() => {
      handleClosePaymentDialog()
      onOpenChange?.(false)
      // 触发成功回调
      if (onSubscriptionSuccess) {
        onSubscriptionSuccess()
      }
    }, 1500)
  }
  
  // 开始轮询支付状态
  const startPollingPaymentStatus = (orderId: string) => {
    // 先确保没有正在进行的轮询
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    
    // 初始化支付状态
    setPaymentStatus(OrderStatus.PENDING)
    
    // 每3秒检查一次支付状态
    pollingIntervalRef.current = setInterval(async () => {
      if (!orderId) return
      
      try {
        const result = await checkPaymentStatus(orderId)
        setPaymentStatus(result.status)
        
        // 如果支付完成（成功或失败），停止轮询
        if (result.status === OrderStatus.SUCCESS || 
            result.status === OrderStatus.FAILED || 
            result.status === OrderStatus.CLOSED) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
      } catch (error) {
        console.error("检查支付状态失败:", error)
        // 出错时不停止轮询，继续尝试
      }
    }, 3000) // 每3秒轮询一次
  }

  // 处理支付
  const handlePayment = async () => {
    if (!selectedTier || selectedTier === "free") return;
    
    try {
      setPaymentLoading(true);
      // 将选中的tier ID转换为MembershipTier类型
      const tierKey = selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1) as MembershipTier;
      const { qrcodeURL, orderId } = await requestMembershipPayment(tierKey);
      
      setPaymentQRCode(qrcodeURL);
      setOrderId(orderId);
      setShowPaymentDialog(true);
      
      // 开始轮询支付状态
      startPollingPaymentStatus(orderId);
    } catch (error) {
      console.error("获取支付信息失败:", error);
      toast.error("获取支付二维码失败，请稍后再试");
    } finally {
      setPaymentLoading(false);
    }
  };

  // 关闭支付对话框
  const handleClosePaymentDialog = () => {
    // 停止轮询
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    setShowPaymentDialog(false);
    setPaymentQRCode(null);
    setOrderId(null);
    setPaymentStatus(null);
  };
  
  // 手动检查支付状态
  const handleCheckPayment = async () => {
    if (!orderId) return;
    
    try {
      // 显示正在检查的提示
      toast.info("正在检查支付状态...");
      
      const result = await checkPaymentStatus(orderId);
      if (result.status === OrderStatus.SUCCESS) {
        setPaymentStatus(OrderStatus.SUCCESS);
      } else if (result.status === OrderStatus.FAILED || result.status === OrderStatus.CLOSED) {
        toast.error("支付失败或已关闭，请重试");
        setPaymentStatus(result.status);
      } else {
        toast.info("未检测到支付完成，请完成支付或重试");
      }
    } catch (error) {
      console.error("检查支付状态失败:", error);
      toast.error("验证支付状态失败，请稍后再试");
    }
  };

  // 控制是否显示触发器
  const showTrigger = open === undefined;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button size="lg">查看会员方案</Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">选择您的会员方案</DialogTitle>
            <DialogDescription className="text-center text-base">
              选择最适合您需求的会员等级，随时可以升级，有效期为一个月
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-3">加载会员数据...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {tiers.map((tier) => (
                <Card 
                  key={tier.id} 
                  className={`relative flex flex-col cursor-pointer transition-all duration-200 ${
                    selectedTier === tier.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground ml-1">{tier.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-6">
            {showActionButton && (
              <Button 
                size="lg" 
                disabled={!selectedTier || loading || selectedTier === "free" || paymentLoading} 
                className="px-8"
                onClick={handlePayment}
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : selectedTier === "free" ? "当前方案" : "确认订阅"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 微信支付二维码对话框 */}
      <Dialog open={showPaymentDialog} onOpenChange={handleClosePaymentDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">微信扫码支付</DialogTitle>
            <DialogDescription className="text-center">
              请使用微信扫描下方二维码完成支付
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {paymentStatus === OrderStatus.SUCCESS ? (
              <div className="flex flex-col items-center justify-center h-64 w-64">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <p className="text-lg font-medium text-green-600">支付成功</p>
              </div>
            ) : paymentQRCode ? (
              <div className="border p-4 rounded-md bg-white">
                <QRCodeSVG 
                  value={paymentQRCode} 
                  size={230} 
                  bgColor={"#ffffff"} 
                  fgColor={"#000000"} 
                  level={"H"} 
                  includeMargin={false}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 w-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <div className="mt-4 space-y-2 text-center">
              {paymentStatus === OrderStatus.SUCCESS ? (
                <p className="text-sm font-medium">您的会员已成功激活！</p>
              ) : (
                <>
                  <p className="text-sm font-medium">打开微信扫一扫，扫描上方二维码</p>
                  <p className="text-xs text-muted-foreground">支付完成后，订阅将自动生效</p>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-center mt-2">
            {paymentStatus === OrderStatus.SUCCESS ? (
              <Button onClick={handleClosePaymentDialog}>
                确定
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleCheckPayment}
              >
                我已完成支付
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
