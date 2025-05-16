"use client"

import { useState, useEffect } from "react"
import { Zap, Loader2 } from "lucide-react"
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
  getVideoPackFeatures, 
  convertVideoPacksToDisplay, 
  VideoPackDisplay, 
  VideoPackTier,
  requestVideoPackPayment 
} from "@/api/videopack"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

interface VideoPackModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showActionButton?: boolean;
}

export default function VideoPackModal({ open, onOpenChange, showActionButton = true }: VideoPackModalProps) {
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const [packs, setPacks] = useState<VideoPackDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentQRCode, setPaymentQRCode] = useState<string | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  // 获取视频包数据
  useEffect(() => {
    const fetchVideoPackData = async () => {
      try {
        setLoading(true)
        const features = await getVideoPackFeatures()
        // 转换后端数据为前端显示格式
        const displayPacks = convertVideoPacksToDisplay(features)
        setPacks(displayPacks)
      } catch (error) {
        console.error("获取视频包数据失败:", error)
        toast.error("获取视频包数据失败，请稍后再试")
      } finally {
        setLoading(false)
      }
    }

    fetchVideoPackData()
  }, [])

  // 处理支付
  const handlePayment = async () => {
    if (!selectedPack) return;
    
    try {
      setPaymentLoading(true);
      // 将选中的pack ID转换为VideoPackTier类型
      const tierKey = selectedPack.charAt(0).toUpperCase() + selectedPack.slice(1) as VideoPackTier;
      const qrcodeURL = await requestVideoPackPayment(tierKey);
      
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
            <Button size="lg">购买视频包</Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">选择视频包</DialogTitle>
            <DialogDescription className="text-center text-base">
              根据您的需求选择合适的视频包，购买的视频时长和文本额度永久有效，不会过期
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-3">加载视频包数据...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {packs.map((pack) => (
                <Card 
                  key={pack.id} 
                  className={`relative flex flex-col cursor-pointer transition-all duration-200 ${
                    selectedPack === pack.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedPack(pack.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-1">
                      {pack.name}
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </CardTitle>
                    <CardDescription>{pack.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{pack.price}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="h-5 w-5 text-green-500 mr-2 flex items-center justify-center">
                          <Zap className="h-4 w-4" />
                        </div>
                        <span>视频时长: {pack.duration}</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 text-green-500 mr-2 flex items-center justify-center">
                          <Zap className="h-4 w-4" />
                        </div>
                        <span>文本额度: {pack.textChars}</span>
                      </li>
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
                disabled={!selectedPack || loading || paymentLoading} 
                className="px-8"
                onClick={handlePayment}
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : "立即购买"}
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
              <p className="text-xs text-muted-foreground">支付完成后，视频包将立即添加到您的账户</p>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                handleClosePaymentDialog();
                toast.success("充值成功！视频包已添加到您的账户");
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