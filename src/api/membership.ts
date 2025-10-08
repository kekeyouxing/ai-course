import instance from "@/api/axios";
// 支付订单状态枚举
export enum OrderStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUND = "refund",
  CLOSED = "closed",
}
// 会员等级类型
export type MembershipTier = "Free" | "Basic" | "Advanced" | "Super";

// 会员特性接口 - 匹配实际接口返回的字段名
export interface MembershipFeature {
  id: number;
  tier: MembershipTier;
  maxCharacters: number;     // 最大虚拟角色数量(0表示无自定义角色)
  maxVideoDuration: number;  // 最大视频时长(秒)
  maxTextLength: number;     // 每个场景最大文本长度
  monthlyPrice: number;      // 每月价格(分)
  createdAt: string;
  updatedAt: string;
}

// 获取会员等级特性接口
export interface GetMembershipResponse {
  code: number;
  data: MembershipFeature[];
  msg: string;
}

// 将后端会员数据转换为前端展示格式
export interface TierDisplay {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: { name: string; included: boolean }[];
}

// 会员支付请求接口
export interface MembershipPaymentRequest {
  tier: MembershipTier;
}

// 会员支付响应接口
export interface MembershipPaymentResponse {
  code: number;
  data: {
    qrcodeURL: string;
    orderId: string;
  };  // 微信支付二维码链接
  msg: string;
}

// 获取会员等级特性
export async function getMembershipFeatures(): Promise<MembershipFeature[]> {
  try {
    const response = await instance.get<GetMembershipResponse>("/memberships/tiers");
    
    if (response.data.code === 0) {
      return response.data.data;
    }
    
    throw new Error(response.data.msg || "获取会员等级特性失败");
  } catch (error) {
    console.error("获取会员等级特性失败:", error);
    throw error;
  }
}

// 根据会员等级获取每个项目可添加的最大角色数量
export function getMaxAvatarsPerProject(tier: MembershipTier): number {
  const maxAvatarsMap: Record<MembershipTier, number> = {
    Free: 1,
    Basic: 1,
    Advanced: 1,
    Super: 1
  };
  
  return maxAvatarsMap[tier] || 1; // 默认返回免费级别限制
}

// 检查用户是否可以在项目中添加更多角色
export function canAddMoreAvatarsToProject(
  tier: MembershipTier,
  currentAvatarCount: number
): { allowed: boolean; maxAllowed: number; message?: string } {
  const maxAllowed = getMaxAvatarsPerProject(tier);
  const allowed = currentAvatarCount < maxAllowed;
  
  return {
    allowed,
    maxAllowed,
    message: allowed 
      ? undefined 
      : `您当前的${tierNames[tier]}套餐最多可添加${maxAllowed}个角色。升级会员可添加更多角色。`
  };
}

// 会员等级名称映射 - 移到外部以便其他函数使用
export const tierNames: Record<MembershipTier, string> = {
  Free: "免费用户",
  Basic: "基础会员",
  Advanced: "高级会员",
  Super: "超级会员"
};

// 将后端会员数据转换为前端展示格式
export function convertFeaturesToDisplay(features: MembershipFeature[]): TierDisplay[] {
  // 会员等级描述映射
  const tierDescriptions: Record<MembershipTier, string> = {
    Free: "体验基础功能，开启AI视频创作之旅",
    Basic: "满足个人创作需求的实用套餐",
    Advanced: "专业创作者的理想选择，功能更强大",
    Super: "企业级全功能套餐，无限创意表达"
  };
  
  return features.map(feature => {
    // 将分转换为元，并格式化为价格字符串
    const priceInYuan = feature.monthlyPrice;
    const priceString = feature.tier === "Free" ? "免费" : `¥${priceInYuan}`;

    // 获取该会员等级的项目最大角色数量
    // const maxAvatarsPerProject = getMaxAvatarsPerProject(feature.tier);

    // 构建特性列表
    const featureList = [
      {
        name: `拥有${feature.maxCharacters}个自定义角色（永久拥有）`,
        included: feature.maxCharacters > 0
      },
      // {
      //   name: `每个项目可使用${maxAvatarsPerProject}个角色`,
      //   included: true
      // },
      {
        name: `视频时长额度${Math.floor(feature.maxVideoDuration / 60)}分钟`,
        included: true
      },
      {
        name: `单场景文本额度${feature.maxTextLength}字符`,
        included: true
      },
    ];
    
    return {
      id: feature.tier.toLowerCase(),
      name: tierNames[feature.tier],
      price: priceString,
      period: feature.tier === "Free" ? "" : "一个月",
      description: tierDescriptions[feature.tier],
      features: featureList
    };
  });
}

// 发起会员支付请求
export async function requestMembershipPayment(tier: MembershipTier): Promise<{qrcodeURL: string; orderId: string}> {
  try {
    const response = await instance.post<MembershipPaymentResponse>(
      "/payments/membership", 
      { tier } as MembershipPaymentRequest
    );
    
    if (response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.msg || "获取支付二维码失败");
  } catch (error) {
    throw error;
  }
}

// 支付状态检查响应接口
export interface PaymentStatusResponse {
  code: number;
  data: {
    status: OrderStatus;
    order_id: string;
  };
  msg: string;
}

// 检查支付状态
export async function checkPaymentStatus(orderId: string): Promise<{status: OrderStatus}> {
  try {
    const response = await instance.get<PaymentStatusResponse>(`/payments/status/${orderId}`);
    
    if (response.data.code === 0 && response.data.data) {
      return { status: response.data.data.status };
    }
    
    throw new Error(response.data.msg || "获取支付状态失败");
  } catch (error) {
    console.error("检查支付状态失败:", error);
    throw error;
  }
}