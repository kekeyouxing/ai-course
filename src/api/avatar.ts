import { AliyunImageProcessResponse } from "@/hooks/VoiceCloningContext"
import instance from "./axios";
import { toast } from "sonner";
// Updated Avatar interface to match backend response
export interface Avatar {
  id: number;
  avatarId: string;
  userId: string;
  name: string;
  url: string;
  checkPass: boolean;
  createdAt: number;
  faceBBox: number[];
  extBBox: number[];
}

// 获取头像列表接口
export async function getAvatars(): Promise<{
  code: number;
  msg: string;
  data?: {
    customAvatars: Avatar[];
    systemAvatars: Avatar[];
  };
}> {
  try {
    const response = await instance.get('/avatars/listAvatar');
    return response.data;
  } catch (error) {
    console.error('获取头像列表失败:', error);
    return {
      code: -1,
      msg: error instanceof Error ? error.message : '获取头像列表失败',
    };
  }
}

// 添加头像接口
export async function addAvatar(file: File, ratio: string, name: string): Promise<{
    code: number;
    msg: string;
    data?: {
        avatarUrl: string;
        detectionResult: AliyunImageProcessResponse;
    };
}> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('ratio', ratio);
    formData.append('name', name);
    try {
        const response = await instance.post('/avatars/addAvatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('添加头像失败:', error);
        return {
            code: -1,
            msg: error instanceof Error ? error.message : '添加头像失败',
        };
    }
}

// 更新头像接口
export async function updateAvatar(
  oldImageUrl: string, 
  name: string, 
  file: File,
  ratio: string,
): Promise<{
  code: number;
  msg: string;
  data?: {
    avatarUrl?: string;
    detectionResult?: AliyunImageProcessResponse;
  };
}> {
  const formData = new FormData();
  formData.append('oldImageUrl', oldImageUrl);
  formData.append('name', name);
  formData.append('ratio', ratio);
  if (file) {
    formData.append('file', file, file.name);
  }
  
  try {
    const response = await instance.post('/avatars/updateAvatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('更新头像失败:', error);
    return {
      code: -1,
      msg: error instanceof Error ? error.message : '更新头像失败',
    };
  }
}
