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

export async function updateSceneTitle(sceneId: string, newTitle: string): Promise<void> {
    try {
        const response = await instance.post<{
            code: number;
            msg: string;
        }>(`/scenes/${sceneId}/title`, {
            title: newTitle
        });

        if (response.data.code !== 0) {
            throw new Error(response.data.msg || "更新场景标题失败");
        }
    } catch (error) {
        console.error("更新场景标题失败:", error);
        throw error;
    }
}

// 删除场景的API函数
export async function deleteScene(sceneId: string): Promise<void> {
    try {
        const response = await instance.delete<{
            code: number;
            msg: string;
        }>(`/scenes/${sceneId}`);
        if (response.data.code !== 0) {
            throw new Error(response.data.msg || "删除场景失败");
        }
    } catch (error) {
        console.error('删除场景API错误:', error);
        throw error;
    }
}