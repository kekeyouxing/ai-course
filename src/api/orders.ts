// src/api/orders.ts
import instance from "@/api/axios";

// PaymentOrderDTO 支付订单DTO
export interface PaymentOrderDTO {
  order_id: string;
  type: string;
  status: string;
  amount: number;
  create_time: string;
  pay_time: string | null;
  description: string;
}

// 支付订单状态枚举
export enum OrderStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUND = "refund",
  CLOSED = "closed",
}

// 订单类型枚举
export enum OrderType {
  MEMBERSHIP = "membership",
  VIDEOPACK = "videopack",
}

// 状态显示名称映射
export const OrderStatusDisplayMap: Record<string, string> = {
  [OrderStatus.PENDING]: "等待支付",
  [OrderStatus.SUCCESS]: "支付成功",
  [OrderStatus.FAILED]: "支付失败",
  [OrderStatus.REFUND]: "已退款",
  [OrderStatus.CLOSED]: "已关闭",
};

// 订单类型显示名称映射
export const OrderTypeDisplayMap: Record<string, string> = {
  [OrderType.MEMBERSHIP]: "会员订阅",
  [OrderType.VIDEOPACK]: "套餐充值",
};

// 分页参数接口
export interface PaginationParams {
  page: number;
  page_size: number;
}

// 获取订单列表响应
export interface GetOrdersResponse {
  code: number;
  data: {
    orders: PaymentOrderDTO[];
    pagination: {
      total: number;
      page: number;
      page_size: number;
    };
  };
  msg: string;
}

// 获取订单列表
export async function getOrders(params: PaginationParams): Promise<GetOrdersResponse['data']> {
  try {
    const response = await instance.get<GetOrdersResponse>('/payments/list', {
      params: params,
    });
    
    if (response.data.code === 0 && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.msg || "获取订单列表失败");
  } catch (error) {
    console.error("获取订单列表失败:", error);
    throw error;
  }
}

// 格式化订单时间
export function formatOrderTime(dateString: string | null): string {
  if (!dateString) return '-';
  
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

// 格式化金额显示
export function formatAmount(amount: number): string {
  return `¥${amount.toFixed(2)}`;
} // 检查支付状态函数


