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

// 声音联合类型
export type Voice = SystemVoice | ClonedVoice;