import instance from "@/api/axios";

// UserResourceLogDTO 用户资源变更日志DTO
export interface UserResourceLogDTO {
  id: number;
  userId: string;
  changeType: string;   // 变更类型：add/consume
  videoSeconds: number; // 视频秒数变更
  textChars: number;    // 文本字符数变更
  source: string;       // 来源：membership/videopack
  sourceId: string;     // 来源ID
  remark: string;       // 备注
  createdAt: string;    // 创建时间
}

// 变更类型枚举
export enum ChangeType {
  ADD = "add",
  CONSUME = "consume",
}

// 来源类型枚举
export enum ResourceSource {
  MEMBERSHIP = "membership",
  VIDEOPACK = "videopack",
}

// 变更类型显示名称映射
export const ChangeTypeDisplayMap: Record<string, string> = {
  [ChangeType.ADD]: "充值",
  [ChangeType.CONSUME]: "消费",
};

// 来源类型显示名称映射
export const ResourceSourceDisplayMap: Record<string, string> = {
  [ResourceSource.MEMBERSHIP]: "会员权益",
  [ResourceSource.VIDEOPACK]: "套餐充值",
};

// 分页参数接口
export interface PaginationParams {
  page: number;
  page_size: number;
}

// 获取资源日志响应
export interface GetResourceLogsResponse {
  code: number;
  msg: string;
  data: {
    data: UserResourceLogDTO[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

// 获取资源使用日志
export async function getResourceLogs(params: PaginationParams): Promise<GetResourceLogsResponse['data']> {
  try {
    const response = await instance.get<GetResourceLogsResponse>('/memberships/resource/logs', {
      params: params,
    });
    
    if (response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.msg || "获取资源使用记录失败");
  } catch (error) {
    console.error("获取资源使用记录失败:", error);
    throw error;
  }
}

// 格式化时间
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// 格式化视频秒数
export function formatVideoSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (seconds === 0) return "0";
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}秒`);
  
  return parts.join('');
}

// 格式化文本字符数
export function formatTextChars(chars: number): string {
  if (chars === 0) return "0";
  
  if (chars >= 10000) {
    return `${(chars / 10000).toFixed(1)}万字`;
  }
  return `${chars}字`;
} 