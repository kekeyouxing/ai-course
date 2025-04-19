import instance from "@/api/axios";
import { Scene } from "@/types/scene";

// 文本转语音请求参数接口
export interface TextToSpeechRequest {
    voiceId: string;  // 声音ID
    sceneId: string;  // 场景ID
    language?: "zh" | "en";  // 可选的语言参数
}

// 文本转语音响应接口
export interface TextToSpeechResponse {
    code: number;
    data: {
        audioLength: number;  // 音频长度（毫秒）
        audioUrl: string;     // 音频URL
    };
    msg: string;
}

// 图像分析生成脚本请求接口
export interface ImageAnalysisRequest {
    sceneId: string;      // 场景ID
    language: "zh" | "en"; // 脚本语言
}

// 图像分析生成脚本响应接口
export interface ImageAnalysisResponse {
    code: number;
    data?: {
        result: string;   // 生成的脚本内容
        usage?: {
            input_tokens: number;
            output_tokens: number;
            total_tokens: number;
        }
    };
    msg: string;
}

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

// 文本转语音API函数
export async function textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    try {
        const response = await instance.post<TextToSpeechResponse>(
            "/scenes/voice/tts", 
            {
                voice_id: request.voiceId,
                scene_id: request.sceneId,
                language: request.language || "zh"  // 默认使用中文
            }
        );
        
        if (response.data.code !== 0) {
            throw new Error(response.data.msg || "文本转语音失败");
        }
        
        return response.data;
    } catch (error) {
        console.error("文本转语音API错误:", error);
        throw error;
    }
}

// 场景图像分析生成脚本API函数
export async function generateScriptFromImageAnalysis(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    try {
        const response = await instance.post<ImageAnalysisResponse>(
            "/scenes/image-analysis",
            {
                scene_id: request.sceneId,
                language: request.language
            }
        );
        
        if (response.data.code !== 0) {
            throw new Error(response.data.msg || "图像分析生成脚本失败");
        }
        
        return response.data;
    } catch (error) {
        console.error("图像分析API错误:", error);
        throw error;
    }
}

// 更新场景内容的API函数
export async function updateScene(sceneId: string, sceneData: Partial<Scene>): Promise<void> {
    try {
        const response = await instance.put<{
            code: number;
            msg: string;
        }>(`/scenes/${sceneId}`, sceneData);
        
        if (response.data.code !== 0) {
            throw new Error(response.data.msg || "更新场景失败");
        }
    } catch (error) {
        console.error("更新场景API错误:", error);
        throw error;
    }
}

// 创建新场景的API函数
export async function createScene(projectId: string, sceneData: Partial<Scene>): Promise<Scene> {
    try {
        const response = await instance.post<{
            code: number;
            data: Scene;
            msg: string;
        }>(`/scenes/project/${projectId}`, sceneData);
        
        if (response.data.code !== 0) {
            throw new Error(response.data.msg || "创建场景失败");
        }
        
        return response.data.data;
    } catch (error) {
        console.error("创建场景API错误:", error);
        throw error;
    }
}

// 复制场景的API函数
export async function duplicateScene(sceneId: string): Promise<Scene> {
    try {
        const response = await instance.post<{
            code: number;
            data: Scene;
            msg: string;
        }>(`/scenes/${sceneId}/duplicate`);
        
        if (response.data.code !== 0) {
            throw new Error(response.data.msg || "复制场景失败");
        }
        
        return response.data.data;
    } catch (error) {
        console.error("复制场景API错误:", error);
        throw error;
    }
}