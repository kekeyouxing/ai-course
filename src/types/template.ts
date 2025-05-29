import { Scene } from './scene';

export interface Template {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  video?: string;
  previewScene?: Scene; // 第一个场景作为预览
  tags: string[] | null;
  language: string;
  voiceId: string;
  voiceSpeed: number;
  voiceVolume: number;
  voicePitch: number;
  voiceEmotion: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  category?: string;
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

// API 包装响应类型
export interface TemplateListApiResponse {
  code: number;
  data: TemplateListResponse;
  msg: string;
}

export interface TemplateApiResponse {
  code: number;
  data: Template;
  msg: string;
}

export interface TemplateScenesApiResponse {
  code: number;
  data: Scene[];
  msg: string;
}

export interface TemplateCategoriesApiResponse {
  code: number;
  data: TemplateCategory[];
  msg: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
} 