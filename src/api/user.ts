import instance from "@/api/axios";

// 用户信息DTO接口
export interface UserInfoDTO {
  // 基本信息
  userID: string;
  phone: string;
  nickname: string;
  avatar: string;

  // 会员信息
  membershipTier: string;
  membershipEnd: string; // ISO日期字符串
  membershipActive: boolean;

  // 资源使用
  memberVideoSeconds: number; // 会员权益-剩余视频秒数
  memberTextChars: number;    // 会员权益-剩余文本字符数
  packageVideoSeconds: number; // 视频包-剩余视频秒数
  packageTextChars: number;   // 视频包-剩余文本字符数
}

// API响应接口
export interface GetUserInfoResponse {
  code: number;
  data: UserInfoDTO;
  msg: string;
}

// 获取用户信息
export async function getUserInfo(): Promise<UserInfoDTO> {
  try {
    const response = await instance.get<GetUserInfoResponse>("/user/info");
    
    if (response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.msg || "获取用户信息失败");
  } catch (error) {
    console.error("获取用户信息失败:", error);
    throw error;
  }
}

// 格式化剩余时间为分钟
export function formatRemainingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}分钟`;
  } 
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return `${hours}小时${remainingMinutes > 0 ? remainingMinutes + '分钟' : ''}`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}天${remainingHours > 0 ? remainingHours + '小时' : ''}`;
}

// 格式化会员到期时间
export function formatMembershipEnd(dateString: string): string {
  if (!dateString) return '非会员';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // 计算天数差异
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return '已过期';
  if (diffDays === 1) return '今天到期';
  if (diffDays <= 30) return `${diffDays}天后到期`;
  
  // 超过30天则显示具体日期
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日到期`;
}

// 获取会员等级名称
export function getMembershipTierName(tier: string): string {
  const tierMap: Record<string, string> = {
    'Free': '免费用户',
    'Basic': '基础会员',
    'Advanced': '高级会员',
    'Super': '超级会员'
  };
  
  return tierMap[tier] || tier;
} 