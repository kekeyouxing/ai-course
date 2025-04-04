import { AnimationMarker } from "@/types/animation";
import instance from "./axios";

// 获取场景的所有动画标记
export async function getSceneAnimationMarkers(sceneId: string): Promise<{
  code: number;
  msg: string;
  data?: {
    markers: AnimationMarker[];
  };
}> {
  try {
    const response = await instance.get(`/scenes/${sceneId}/animation-markers`);
    return response.data;
  } catch (error) {
    console.error("获取动画标记失败:", error);
    return {
      code: -1,
      msg: error instanceof Error ? error.message : "获取动画标记失败",
    };
  }
}

// 同步场景的脚本和动画标记
export async function syncSceneScript(
  sceneId: string,
  data: {
    script: string,
    markers: AnimationMarker[]
  }
): Promise<{
  code: number;
  msg: string;
  data?: {
    markers: AnimationMarker[];
  };
}> {
  try {
    const response = await instance.post(`/scenes/${sceneId}/sync`, data);
    return response.data;
  } catch (error) {
    console.error("同步脚本和动画标记失败:", error);
    return {
      code: -1,
      msg: error instanceof Error ? error.message : "同步脚本和动画标记失败",
    };
  }
}