import instance from '@/api/axios';

// 项目进度状态类型
export type ProjectProgressStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED';
interface ApiResponse<T> {
    code: number;
    data: T;
    msg: string;
  }
// 项目进度项
export interface ProjectProgress {
  id: number;
  projectId: string;
  projectName: string;
  status: ProjectProgressStatus;
  url?: string;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string;
}

// 分页信息
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
}

// 项目进度列表响应
export interface ProjectProgressListResponse {
  progress: ProjectProgress[];
  pagination: Pagination;
}

/**
 * 获取用户的项目进度列表
 * @param page 页码，默认1
 * @param pageSize 每页条数，默认10
 * @returns 带分页的项目进度列表
 */
export async function getUserProjectProgressList(page: number = 1, pageSize: number = 10): Promise<ProjectProgressListResponse> {
  try {
    const response = await instance.get<ApiResponse<ProjectProgressListResponse>>('/project-progress/user/list', {
      params: {
        page,
        pageSize
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('获取项目进度列表失败:', error);
    // 返回空数据
    return {
      progress: [],
      pagination: {
        total: 0,
        page,
        pageSize
      }
    };
  }
}

/**
 * 获取项目进度状态的中文名称
 * @param status 进度状态
 * @returns 状态的中文名称
 */
export function getProgressStatusText(status: ProjectProgressStatus): string {
  switch (status) {
    case 'PENDING':
      return '处理中';
    case 'SUCCEEDED':
      return '已完成';
    case 'FAILED':
      return '失败';
    default:
      return '未知状态';
  }
}

/**
 * 获取项目进度状态的样式类
 * @param status 进度状态
 * @returns 对应的样式类名
 */
export function getProgressStatusClass(status: ProjectProgressStatus): {bgColor: string, textColor: string} {
  switch (status) {
    case 'PENDING':
      return { bgColor: 'bg-blue-50', textColor: 'text-blue-600' };
    case 'SUCCEEDED':
      return { bgColor: 'bg-green-50', textColor: 'text-green-600' };
    case 'FAILED':
      return { bgColor: 'bg-red-50', textColor: 'text-red-600' };
    default:
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
  }
}

/**
 * 通过项目ID获取项目进度
 * @param projectId 项目ID
 * @returns 项目进度数据
 */
export async function getProjectProgressByProjectId(projectId: string): Promise<ProjectProgress | null> {
  try {
    const response = await instance.get<ApiResponse<ProjectProgress>>(`/project-progress/${projectId}`);
    return response.data.data;
  } catch (error) {
    console.error('获取项目进度失败:', error);
    return null;
  }
} 