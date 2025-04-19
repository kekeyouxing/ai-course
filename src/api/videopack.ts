import instance from "@/api/axios";

// 视频包等级类型
export type VideoPackTier = "Small" | "Medium" | "Large" | "Extra";

// 视频包特性接口
export interface VideoPackFeature {
  id: number;
  tier: VideoPackTier;
  duration: number;     // 视频时长(秒)
  textChars: number;         // 文本字符数
  price: number;        // 价格(分)
  description: string;       // 描述
  createdAt: string;
  updatedAt: string;
}

// 获取视频包特性接口
export interface GetVideoPackResponse {
  code: number;
  data: VideoPackFeature[];
  msg: string;
}

// 将后端视频包数据转换为前端展示格式
export interface VideoPackDisplay {
  id: string;
  name: string;
  price: string;
  duration: string;
  textChars: string;
  description: string;
}

// 视频包支付请求接口
export interface VideoPackPaymentRequest {
  tier: VideoPackTier;
}

// 视频包支付响应接口
export interface VideoPackPaymentResponse {
  code: number;
  data: string;  // 微信支付深度链接
  msg: string;
}

// 获取视频包特性
export async function getVideoPackFeatures(): Promise<VideoPackFeature[]> {
  try {
    const response = await instance.get<GetVideoPackResponse>("/memberships/videopack/tiers");
    
    if (response.data.code === 0) {
      return response.data.data;
    }
    
    throw new Error(response.data.msg || "获取视频包特性失败");
  } catch (error) {
    console.error("获取视频包特性失败:", error);
    throw error;
  }
}

// 将后端视频包数据转换为前端展示格式
export function convertVideoPacksToDisplay(packs: VideoPackFeature[]): VideoPackDisplay[] {
  // 视频包等级名称映射
  const tierNames: Record<VideoPackTier, string> = {
    Small: "小型包",
    Medium: "中型包",
    Large: "大型包",
    Extra: "超大包"
  };
  
  return packs.map(pack => {
    // 将分转换为元，并格式化为价格字符串
    const priceInYuan = pack.price;
    
    // 转换视频时长为分钟
    const durationMinutes = Math.floor(pack.duration / 60);
    
    return {
      id: pack.tier.toLowerCase(),
      name: tierNames[pack.tier],
      price: `¥${priceInYuan}`,
      duration: `${durationMinutes}分钟`,
      textChars: `${pack.textChars}字符`,
      description: pack.description
    };
  });
}

// 发起视频包支付请求
export async function requestVideoPackPayment(tier: VideoPackTier): Promise<string> {
  try {
    const response = await instance.post<VideoPackPaymentResponse>(
      "/payments/videopack", 
      { tier } as VideoPackPaymentRequest
    );
    
    if (response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.msg || "获取支付二维码失败");
  } catch (error) {
    console.error("发起视频包支付请求失败:", error);
    throw error;
  }
} 