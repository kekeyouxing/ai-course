import instance from "./axios";

// 背景库列表查询参数
export interface BackgroundListQuery {
  type?: string;       // 过滤背景类型：image/video
  page?: number;      // 页码
  pageSize?: number;  // 每页数量
  category?: string; // 分类：my（我的）或 system（系统）或 color（颜色）
  
}

// 背景项定义
export interface ContentBackgroundItem {
  id: string;
  type: string;  // "image" 或 "video"
  category: string;  // 分类：my（我的）或 system（系统）或 color（颜色）
  src: string;
  thumbnail?: string; //视频缩略图
  name: string;
  duration?: number;  // 视频时长（秒）
}

// 背景库列表响应
export interface BackgroundListResponse {
  code: number;
  data: {
    backgrounds: Array<ContentBackgroundItem>;
    total: number;
    page: number;
    pageSize: number;
  };
  msg?: string;
}

// 上传背景响应
interface UploadBackgroundResponse {
  code: number;
  data: ContentBackgroundItem;
  msg?: string;
}

// 获取背景库列表
export const getBackgroundList = async (query: BackgroundListQuery = {}) => {
  try {
    const response = await instance.get<BackgroundListResponse>("/background/list", {
      params: query
    });
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "获取背景列表失败");
  }
};

// 创建背景文件
export const createBackground = async (req: ContentBackgroundItem) => {
  try {
    const response = await instance.post<UploadBackgroundResponse>("/background/create", req, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "上传失败");
  }
};

// 重命名背景
export const renameBackground = async (id: string, name: string) => {
  try {
    const response = await instance.put(`/background/rename/${id}`, { name }, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "重命名失败");
  }
};

// 删除背景
export const deleteBackground = async (id: string) => {
  try {
    const response = await instance.delete(`/background/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "删除失败");
  }
}; 