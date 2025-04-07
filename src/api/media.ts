import instance from "./axios";

// 媒体库列表查询参数
export interface MediaLibraryListQuery {
  type?: string;      // 过滤媒体类型: image/video
  page?: number;      // 页码
  pageSize?: number;  // 每页数量
  category?: string; // 分类：my（我的）或 system（系统）
}
export interface ContentMediaItem {
  id: string;
  type: string;     // "image" 或 "video"
  category: string;  // 分类：my（我的）或 system（系统）
  src: string;
  thumbnail?: string; // 视频缩略图
  name: string;
  duration?: number; // 视频时长（秒）
}
// 媒体库列表响应
export interface MediaLibraryListResponse {
  code: number;
  data: {
    media: Array<ContentMediaItem>;
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

// 重命名媒体
export const renameMedia = async (id: string, name: string) => {
  try {
    const response = await instance.put(`/media/rename/${id}`, { name }, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "重命名失败");
  }
};

// 删除媒体
export const deleteMedia = async (id: string) => {
  try {
    const response = await instance.delete(`/media/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "删除失败");
  }
};