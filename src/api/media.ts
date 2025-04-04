import instance from "./axios";

// 媒体库列表查询参数
export interface MediaLibraryListQuery {
  category?: string;      // 过滤媒体类型
  page?: number;      // 页码
  pageSize?: number;  // 每页数量
  isSystem?: boolean; // 是否为系统媒体
}
export interface ContentMediaItem {
  id: string
  category: string
  src: string
  thumbnail?: string
  name: string
}
// 媒体库列表响应
export interface MediaLibraryListResponse {
  code: number;
  data: {
    media: Array<{
      id: string;
      category: string;
      name: string;
      src: string;
      thumbnail?: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
  };
  msg?: string;
}

// 上传媒体响应
interface UploadMediaResponse {
  code: number;
  data: ContentMediaItem
  msg?: string;
}

// 获取媒体库列表
export const getMediaList = async (query: MediaLibraryListQuery = {}) => {
  try {
    const response = await instance.get<MediaLibraryListResponse>("/media/list", {
      params: query
    });
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "获取媒体列表失败");
  }
};

// 创建媒体文件
export const createMedia = async (req: ContentMediaItem) => {

  try {
    const response = await instance.post<UploadMediaResponse>("/media/create", req, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "上传失败");
  }
};