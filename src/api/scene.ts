import instance from "@/api/axios";
import { Scene } from "@/types/scene";

export async function getScenesByProjectId(projectId: string): Promise<Scene[]> {
    try {
        const response = await instance.get<{
            code: number;
            data: Scene[];
            msg: string;
        }>(`/scenes/project/${projectId}`);
        
        if (response.data.code === 0) {
            return response.data.data.map(scene => ({
                ...scene
            }));
        }
        throw new Error(response.data.msg || "获取场景失败");
    } catch (error) {
        console.error("获取场景失败:", error);
        throw error;
    }
}