"use client"

import { useState, useEffect } from "react"
import { Check, X, Loader2 } from "lucide-react"
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
  requestMembershipPayment 
} from "@/api/membership"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

interface SubscriptionModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [tiers, setTiers] = useState<TierDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentQRCode, setPaymentQRCode] = useState<string | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

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

  // 处理支付
  const handlePayment = async () => {
    if (!selectedTier || selectedTier === "free") return;
    
    try {
      setPaymentLoading(true);
      // 将选中的tier ID转换为MembershipTier类型
      const tierKey = selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1) as MembershipTier;
      const qrcodeURL = await requestMembershipPayment(tierKey);
      
      setPaymentQRCode(qrcodeURL);
      setShowPaymentDialog(true);
    } catch (error) {
      console.error("获取支付信息失败:", error);
      toast.error("获取支付二维码失败，请稍后再试");
    } finally {
      setPaymentLoading(false);
    }
  };

  // 关闭支付对话框
  const handleClosePaymentDialog = () => {
    setShowPaymentDialog(false);
    setPaymentQRCode(null);
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
              选择最适合您需求的会员等级，随时可以升级或降级
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
            {paymentQRCode ? (
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
              <p className="text-sm font-medium">打开微信扫一扫，扫描上方二维码</p>
              <p className="text-xs text-muted-foreground">支付完成后，订阅将立即生效</p>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                handleClosePaymentDialog();
                toast.success("感谢您的支持！订阅已成功");
                onOpenChange?.(false);
              }}
            >
              我已完成支付
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
