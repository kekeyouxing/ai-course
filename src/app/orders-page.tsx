import React, { useEffect, useState } from "react";
import { getOrders, formatOrderTime, formatAmount, OrderStatusDisplayMap, OrderTypeDisplayMap, type PaymentOrderDTO } from "@/api/orders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState<PaymentOrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders({ page, page_size: pageSize });
      setOrders(response.orders);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error("获取订单列表失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, pageSize]);

  const maxPage = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= maxPage) {
      setPage(newPage);
    }
  };

  // 获取状态对应的样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-amber-600 bg-amber-100";
      case "failed":
      case "closed":
        return "text-red-600 bg-red-100";
      case "refund":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            订单记录
          </CardTitle>
          <CardDescription>查看您的所有支付记录和订单状态</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 订单表格 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">订单编号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">订单类型</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">金额</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">创建时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">支付时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">描述</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // 加载状态
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index} className="border-b">
                      {Array(7).fill(0).map((_, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.length > 0 ? (
                  // 订单数据
                  orders.map((order) => (
                    <tr key={order.order_id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{order.order_id}</td>
                      <td className="px-4 py-3 text-sm">{OrderTypeDisplayMap[order.type] || order.type}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatAmount(order.amount)}</td>
                      <td className="px-4 py-3 text-sm">{formatOrderTime(order.create_time)}</td>
                      <td className="px-4 py-3 text-sm">{formatOrderTime(order.pay_time)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                          {OrderStatusDisplayMap[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{order.description}</td>
                    </tr>
                  ))
                ) : (
                  // 空状态
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      暂无订单记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* 分页 */}
          {!loading && orders.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                共 {total} 条记录，第 {page} / {maxPage} 页
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= maxPage}
                >
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 