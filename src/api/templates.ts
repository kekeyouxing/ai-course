import { Template, TemplateCategory, TemplateListResponse, TemplateListApiResponse, TemplateApiResponse, TemplateScenesApiResponse, TemplateCategoriesApiResponse } from '@/types/template';
import { Scene } from '@/types/scene';
import instance from './axios';
import { toast } from 'sonner';

/**
 * 获取模板列表（分页）
 */
export async function getTemplates(page: number = 1, pageSize: number = 12): Promise<TemplateListResponse> {
  try {
    const response = await instance.get<TemplateListApiResponse>('/templates/list', {
      params: { page, pageSize }
    });
    
    // 检查API响应状态
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || 'API request failed');
    }
    
    return response.data.data;
  } catch (error) {
    toast.error('获取模板列表失败');
    throw error; // 不再返回模拟数据，而是抛出错误
  }
}

/**
 * 获取模板的完整场景列表
 */
export async function getTemplateScenes(templateId: string): Promise<Scene[]> {
  try {
    const response = await instance.get<TemplateScenesApiResponse>(`/templates/${templateId}/scenes`);
    
    // 检查API响应状态
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || 'API request failed');
    }
    
    return response.data.data;
  } catch (error) {
    toast.error('获取模板场景列表失败');
    throw error; // 不再返回模拟数据，而是抛出错误
  }
}

/**
 * 根据ID获取模板详情
 */
export async function getTemplateById(id: string): Promise<Template | null> {
  try {
    const response = await instance.get<TemplateApiResponse>(`/templates/${id}`);
    
    // 检查API响应状态
    if (response.data.code !== 0) {
      toast.error(`获取模板详情失败: ${response.data.msg || 'API request failed'}`);
      throw new Error(response.data.msg || 'API request failed');
    }
    
    return response.data.data;
  } catch (error) {
    toast.error('获取模板详情失败');
    return null;
  }
}

/**
 * 获取模板分类
 */
export async function getTemplateCategories(): Promise<TemplateCategory[]> {
  try {
    const response = await instance.get<TemplateCategoriesApiResponse>('/templates/categories');
    
    // 检查API响应状态
    if (response.data.code !== 0) {
      toast.error(`获取模板分类失败: ${response.data.msg || 'API request failed'}`);
      throw new Error(response.data.msg || 'API request failed');
    }
    
    return response.data.data;
  } catch (error) {
    toast.error('获取模板分类失败');
    throw error; // 不再返回模拟数据，而是抛出错误
  }
}

/**
 * 基于模板创建项目
 */
export async function createProjectFromTemplate(templateId: string, projectName?: string): Promise<{ projectId: string }> {
  try {
    const response = await instance.post('/templates/create-project', {
      templateId,
      name: projectName || `Project`
    });
    
    // 检查API响应状态
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || 'API request failed');
    }
    
    // 转换API返回的数据结构，将project_id转换为projectId
    return {
      projectId: response.data.data.project_id
    };
  } catch (error) {
    toast.error('基于模板创建项目失败');
    throw error;
  }
}