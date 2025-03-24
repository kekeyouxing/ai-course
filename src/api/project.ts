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
                thumbnail: project.thumbnail || undefined
            }));
        }
        console.error("获取项目失败:", response.data.msg);
        return [];
    } catch (error) {
        console.error("网络请求异常:", error);
        return [];
    }
}

// 保留模拟数据（使用时需注释真实请求）
// return [
//     ...模拟数据保持原样...
// ] as Project[];

export async function deleteProject(id: string) {
    await instance.delete(`/projects/${id}`)
    // revalidatePath("/projects")
}

// 在现有导出下方添加新方法
export async function createProject(
    type: "empty" | "ppt", 
    pptUrl?: string
): Promise<string> {
    try {
        const response = await instance.post<{
            code: number;
            data: string;
            msg: string;
        }>("/projects/create", {
            selectType: type,
            pptUrl: type === "ppt" ? pptUrl : undefined
        });

        if (response.data.code === 0) {
            return response.data.data;
        }
        throw new Error(response.data.msg || "项目创建失败");
    } catch (error) {
        console.error("创建项目失败:", error);
        throw error;
    }
}