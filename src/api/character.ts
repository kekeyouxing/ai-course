import instance from '@/api/axios';
// 系统声音数据结构
export interface SystemVoice {
    voice_id: string;
    voice_name: string;
    description: string;
    audio_url: string;
    gender: string;
    language: string;
}

// 自定义声音数据结构
export interface ClonedVoice {
    character_id: string;
    voice_id: string;
    created_time: string;
    name: string;
    avatar_url: string;
    gender: string;
    language: string;
    face_bbox: number[];
    ext_bbox: number[];
    audio_url: string;
}

// 获取所有声音数据（系统声音和自定义声音）
export async function getVoices() {
    try {
        const response = await instance.get('/characters/voices');
        if (response.data && response.data.code === 0) {
            return {
                systemVoices: response.data.data.system_voice || [],
                clonedVoices: response.data.data.voice_cloning || [],
                success: true
            };
        } else {
            console.error('获取声音数据失败:', response.data?.message);
            return {
                systemVoices: [],
                clonedVoices: [],
                success: false,
                message: response.data?.message || '获取声音数据失败'
            };
        }
    } catch (error) {
        console.error('获取声音数据出错:', error);
        return {
            systemVoices: [],
            clonedVoices: [],
            success: false,
            message: '获取声音数据出错'
        };
    }
}

// 删除自定义声音
export async function deleteClonedVoice(characterId: string) {
    try {
        const response = await instance.delete(`/characters/voice/delete/${characterId}`);
        return {
            success: response.data && response.data.code === 0,
            message: response.data?.message || '操作完成'
        };
    } catch (error) {
        console.error('删除声音出错:', error);
        return {
            success: false,
            message: '删除声音出错'
        };
    }
}

