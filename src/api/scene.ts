import instance from "@/api/axios";
import { Scene } from "@/types/scene";

export async function getScenesByProjectId(projectId: string): Promise<Scene[]> {
    try {
        const response = await instance.get<{
            code: number;
            data: {
                scenes: Scene[];
                pagination: {
                    total: number;
                    page: number;
                    pageSize: number;
                }
            };
            msg: string;
        }>(`/scenes/project/${projectId}`);
        
        if (response.data.code === 0) {
            // 从 data.scenes 中获取场景数据
            return response.data.data.scenes.map(scene => ({
                ...scene
            }));
        }
        throw new Error(response.data.msg || "获取场景失败");
    } catch (error) {
        console.error("获取场景失败:", error);
        throw error;
    }
}