import { Scene } from './scene';

export interface Template {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  video?: string;
  previewScene?: Scene; // 第一个场景作为预览
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

// 分页响应类型
export interface TemplateListResponse {
  templates: Template[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
} 