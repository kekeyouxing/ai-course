import { Template, TemplateCategory, TemplateListResponse } from '@/types/template';
import { Scene } from '@/types/scene';
import instance from './axios';

/**
 * 获取模板列表（分页）
 */
export async function getTemplates(page: number = 1, pageSize: number = 12): Promise<TemplateListResponse> {
  try {
    const response = await instance.get('/templates/list', {
      params: { page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    // 返回模拟数据作为fallback
    return getMockTemplateList(page, pageSize);
  }
}

/**
 * 获取模板的完整场景列表
 */
export async function getTemplateScenes(templateId: string): Promise<Scene[]> {
  try {
    const response = await instance.get(`/templates/${templateId}/scenes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching template scenes:', error);
    // 返回模拟数据作为fallback
    return getMockTemplateScenes(templateId);
  }
}

/**
 * 根据ID获取模板详情
 */
export async function getTemplateById(id: string): Promise<Template | null> {
  try {
    const response = await instance.get(`/templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

/**
 * 获取模板分类
 */
export async function getTemplateCategories(): Promise<TemplateCategory[]> {
  try {
    const response = await instance.get('/templates/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching template categories:', error);
    return getMockCategories();
  }
}

/**
 * 基于模板创建项目
 */
export async function createProjectFromTemplate(templateId: string, projectName?: string): Promise<{ projectId: string }> {
  try {
    const response = await instance.post('/projects/from-template', {
      templateId,
      name: projectName || `Project from ${templateId}`
    });
    return response.data;
  } catch (error) {
    console.error('Error creating project from template:', error);
    throw error;
  }
}

/**
 * 模拟模板分页数据
 */
function getMockTemplateList(page: number, pageSize: number): TemplateListResponse {
  const allTemplates = getMockTemplates();
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const templates = allTemplates.slice(startIndex, endIndex);
  
  return {
    templates,
    pagination: {
      total: allTemplates.length,
      page,
      pageSize,
      hasMore: endIndex < allTemplates.length
    }
  };
}

/**
 * 模拟模板完整数据
 */
function getMockTemplates(): Template[] {
  return [
    {
      id: "template-1",
      title: "Networking and Relationship Building",
      description: "Professional networking and relationship building template",
      thumbnail: "/api/placeholder/400/300",
      video: "/api/placeholder/video.mp4",
      previewScene: {
        id: "scene-1",
        title: "Scene 1",
        background: { type: "color", color: "#10B981" },
        texts: [{
          content: "Networking and Relationship Building",
          fontSize: 48,
          x: 100,
          y: 400,
          width: 800,
          height: 200,
          rotation: 0,
          fontFamily: "'Noto Sans SC', 'Noto Sans CJK SC'",
          fontColor: "#ffffff",
          backgroundColor: "rgba(255, 255, 255, 0)",
          bold: true,
          italic: false,
          alignment: "left" as const,
          zIndex: 2
        }],
        shapes: [],
        media: [],
        avatar: null
      },
      tags: ["Compliance", "E-Learning"],
      category: "Business",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "template-2", 
      title: "Cybersecurity training",
      description: "Prevent phishing attacks training template",
      thumbnail: "/api/placeholder/400/300",
      video: "/api/placeholder/video.mp4",
      previewScene: {
        id: "scene-2",
        title: "Scene 2",
        background: { type: "color", color: "#7C3AED" },
        texts: [{
          content: "Prevent Phishing Attacks",
          fontSize: 64,
          x: 100,
          y: 200,
          width: 800,
          height: 200,
          rotation: 0,
          fontFamily: "'Noto Sans SC', 'Noto Sans CJK SC'",
          fontColor: "#ffffff",
          backgroundColor: "rgba(255, 255, 255, 0)",
          bold: true,
          italic: false,
          alignment: "left" as const,
          zIndex: 2
        }],
        shapes: [],
        media: [],
        avatar: null
      },
      tags: ["Compliance", "E-Learning"],
      category: "Security",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "template-3",
      title: "Marketing Agency",
      description: "Supercharge your business with marketing",
      thumbnail: "/api/placeholder/400/300",
      video: "/api/placeholder/video.mp4",
      previewScene: {
        id: "scene-3",
        title: "Scene 3",
        background: { type: "color", color: "#F97316" },
        texts: [{
          content: "Supercharge your business with marketing",
          fontSize: 48,
          x: 100,
          y: 150,
          width: 800,
          height: 200,
          rotation: 0,
          fontFamily: "'Noto Sans SC', 'Noto Sans CJK SC'",
          fontColor: "#ffffff",
          backgroundColor: "rgba(255, 255, 255, 0)",
          bold: true,
          italic: false,
          alignment: "left",
          zIndex: 2
        }],
        shapes: [],
        media: [],
        avatar: null
      },
      tags: ["Marketing", "Business"],
      category: "Marketing",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    // 添加更多模拟数据以支持分页
    {
      id: "template-4",
      title: "数据分析报告",
      description: "专业数据分析展示模板",
      thumbnail: "/api/placeholder/400/300",
      video: "/api/placeholder/video.mp4",
      previewScene: {
        id: "scene-4",
        title: "Scene 4",
        background: { type: "color", color: "#3B82F6" },
        texts: [{
          content: "数据分析报告",
          fontSize: 52,
          x: 100,
          y: 300,
          width: 800,
          height: 200,
          rotation: 0,
          fontFamily: "'Noto Sans SC', 'Noto Sans CJK SC'",
          fontColor: "#ffffff",
          backgroundColor: "rgba(255, 255, 255, 0)",
          bold: true,
          italic: false,
          alignment: "left",
          zIndex: 2
        }],
        shapes: [],
        media: [],
        avatar: null
      },
      tags: ["数据", "分析"],
      category: "Business",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "template-5",
      title: "产品发布会",
      description: "产品发布会演示模板",
      thumbnail: "/api/placeholder/400/300",
      video: "/api/placeholder/video.mp4",
      previewScene: {
        id: "scene-5",
        title: "Scene 5",
        background: { type: "color", color: "#EC4899" },
        texts: [{
          content: "产品发布会",
          fontSize: 56,
          x: 100,
          y: 350,
          width: 800,
          height: 200,
          rotation: 0,
          fontFamily: "'Noto Sans SC', 'Noto Sans CJK SC'",
          fontColor: "#ffffff",
          backgroundColor: "rgba(255, 255, 255, 0)",
          bold: true,
          italic: false,
          alignment: "left",
          zIndex: 2
        }],
        shapes: [],
        media: [],
        avatar: null
      },
      tags: ["产品", "发布"],
      category: "Marketing",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ];
}

/**
 * 模拟获取模板场景数据
 */
function getMockTemplateScenes(templateId: string): Scene[] {
  // 模拟每个模板有3个场景
  const baseScenes: any[] = [
    {
      id: `${templateId}-scene-1`,
      title: "场景 1",
      background: { type: "color", color: "#10B981" },
      texts: [{
        content: "第一个场景",
        fontSize: 48,
        x: 100,
        y: 400,
        width: 800,
        height: 200,
        rotation: 0,
        fontFamily: "'Noto Sans SC', 'Noto Sans CJK SC'",
        fontColor: "#ffffff",
        backgroundColor: "rgba(255, 255, 255, 0)",
        bold: true,
        italic: false,
        alignment: "left",
        zIndex: 2
      }],
      shapes: [],
      media: [],
      avatar: null
    },
    {
      id: `${templateId}-scene-2`,
      title: "场景 2",
      background: { type: "color", color: "#7C3AED" },
      texts: [{
        content: "第二个场景",
        fontSize: 48,
        x: 100,
        y: 400,
        width: 800,
        height: 200,
        rotation: 0,
        fontFamily: "'Noto Sans SC', 'Noto Sans CJK SC'",
        fontColor: "#ffffff",
        backgroundColor: "rgba(255, 255, 255, 0)",
        bold: true,
        italic: false,
        alignment: "left",
        zIndex: 2
      }],
      shapes: [],
      media: [],
      avatar: null
    },
    {
      id: `${templateId}-scene-3`,
      title: "场景 3",
      background: { type: "color", color: "#F97316" },
      texts: [{
        content: "第三个场景",
        fontSize: 48,
        x: 100,
        y: 400,
        width: 800,
        height: 200,
        rotation: 0,
        fontFamily: "'Noto Sans SC', 'Noto Sans CJK SC'",
        fontColor: "#ffffff",
        backgroundColor: "rgba(255, 255, 255, 0)",
        bold: true,
        italic: false,
        alignment: "left",
        zIndex: 2
      }],
      shapes: [],
      media: [],
      avatar: null
    }
  ];
  
  return baseScenes as Scene[];
}

/**
 * 模拟分类数据
 */
function getMockCategories(): TemplateCategory[] {
  return [
    { id: "business", name: "Business", description: "Business templates" },
    { id: "security", name: "Security", description: "Security training templates" },
    { id: "marketing", name: "Marketing", description: "Marketing templates" }
  ];
} 