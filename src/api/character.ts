import instance from '@/api/axios';

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

