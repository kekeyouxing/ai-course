// deleteProject
import instance from "@/api/axios"
import { Project } from "@/types/scene";

export async function getProjects(): Promise<Project[]> {
    try {
        const response = await instance.get<{
            code: number;
            data: {
                projects: Project[];
                pagination: {
                    total: number;
                    page: number;
                    pageSize: number;
                }
            };
            msg: string;
        }>("/projects/list");
        
        if (response.data.code === 0) {
            return response.data.data.projects.map(project => ({
                ...project,
                updatedAt: new Date(project.updatedAt),
            }));
        }
        console.error("获取项目失败:", response.data.msg);
        return [];
    } catch (error) {
        console.error("网络请求异常:", error);
        return [];
    }
}

export async function deleteProject(id: string) {
    try {
        const response = await instance.delete<{
            code: number;
            data: null;
            msg: string;
        }>(`/projects/${id}`);
        
        if (response.data.code === 0) {
            return true;
        }
        throw new Error(response.data.msg || "删除项目失败");
    } catch (error) {
        console.error("删除项目失败:", error);
        throw error;
    }
}

// 添加重命名项目的方法
export async function renameProject(id: string, newName: string) {
    try {
        const response = await instance.post<{
            code: number;
            data: null;
            msg: string;
        }>(`/projects/${id}/rename`, {
            name: newName
        });
        
        if (response.data.code === 0) {
            return true;
        }
        throw new Error(response.data.msg || "重命名项目失败");
    } catch (error) {
        console.error("重命名项目失败:", error);
        throw error;
    }
}

// 在现有导出下方添加新方法
export async function createProject(
    type: "empty" | "ppt", 
    pptUrl?: string
): Promise<string> {
    try {
        const response = await instance.post<{
            code: number;
            data: {
                projectId: string;
            };
            msg: string;
        }>("/projects/create", {
            selectType: type,
            pptUrl: type === "ppt" ? pptUrl : undefined
        });

        if (response.data.code === 0) {
            return response.data.data.projectId;
        }
        throw new Error(response.data.msg || "项目创建失败");
    } catch (error) {
        console.error("创建项目失败:", error);
        throw error;
    }
}
