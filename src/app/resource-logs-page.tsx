import React, { useEffect, useState } from "react";
import { getResourceLogs, formatDateTime, formatVideoSeconds, formatTextChars, ChangeTypeDisplayMap, ResourceSourceDisplayMap, type UserResourceLogDTO } from "@/api/resource-logs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LineChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResourceLogsPage() {
  const [logs, setLogs] = useState<UserResourceLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getResourceLogs({ page, page_size: pageSize });
      setLogs(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error("获取资源使用记录失败", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize]);

  const maxPage = Math.ceil(total / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= maxPage) {
      setPage(newPage);
    }
  };

  // 获取变更类型对应的样式
  const getChangeTypeStyle = (changeType: string) => {
    switch (changeType) {
      case "add":
        return "text-green-600 bg-green-100";
      case "consume":
        return "text-amber-600 bg-amber-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // 获取资源数值对应的样式
  const getResourceValueStyle = (value: number, changeType: string) => {
    if (value === 0) return "";
    
    if (changeType === "add") {
      return "text-green-600 font-medium";
    } else {
      return "text-amber-600 font-medium";
    }
  };

  // 格式化资源变更数量，根据类型添加正负号
  const formatResourceValue = (value: number, changeType: string, isVideo: boolean) => {
    if (value === 0) return "-";
    
    const prefix = changeType === "add" ? "+" : "-";
    return `${prefix} ${isVideo ? formatVideoSeconds(Math.abs(value)) : formatTextChars(Math.abs(value))}`;
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            使用记录
          </CardTitle>
          <CardDescription>查看您的资源使用和充值历史记录</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 资源使用记录表格 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作类型</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">视频时长</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">文本字数</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">来源</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">备注</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // 加载状态
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index} className="border-b">
                      {Array(6).fill(0).map((_, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  // 记录数据
                  logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeTypeStyle(log.changeType)}`}>
                          {ChangeTypeDisplayMap[log.changeType] || log.changeType}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm ${getResourceValueStyle(log.videoSeconds, log.changeType)}`}>
                        {formatResourceValue(log.videoSeconds, log.changeType, true)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${getResourceValueStyle(log.textChars, log.changeType)}`}>
                        {formatResourceValue(log.textChars, log.changeType, false)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {ResourceSourceDisplayMap[log.source] || log.source}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.remark || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  // 空状态
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      暂无使用记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* 分页 */}
          {!loading && logs.length > 0 && (
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