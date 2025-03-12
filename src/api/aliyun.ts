import instance from './axios';
import {toast} from "sonner";

interface AliyunImageProcessParams {
  image_url: string;
  ratio: string;
}

// 修改接口以匹配实际返回的数据结构
interface AliyunImageProcessResponse {
  checkPass: boolean;  // 对应 check_pass
  faceBBox: number[];  // 对应 face_bbox
  extBBox: number[];   // 对应 ext_bbox
}

/**
 * 调用阿里云图像处理服务
 * @param params 包含图像URL和处理比例的参数对象
 * @returns 处理后的响应数据
 */
export const faceDetect = async (params: AliyunImageProcessParams): Promise<AliyunImageProcessResponse> => {
  try {
    const response = await instance.post('/aliyun/faceDetect', params);
    if (response.status !== 200) {
        toast.error('图像处理请求失败');
        return {
            checkPass: false,
            faceBBox: [],
            extBBox: []
        }
    }
    if (response.data.code !== 0) {
      toast.error(response.data.msg);
      return {
        checkPass: false,
        faceBBox: [],
        extBBox: []
      }
    }
    
    // 将蛇形命名转换为驼峰命名
    const { check_pass, face_bbox, ext_bbox } = response.data.data;
    return {
      checkPass: check_pass,
      faceBBox: face_bbox,
      extBBox: ext_bbox
    };
  } catch (error) {
    throw new Error('图像处理请求失败');
  }
};
