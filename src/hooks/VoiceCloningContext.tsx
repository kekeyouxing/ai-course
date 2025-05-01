import instance from '@/api/axios';
import { ClonedVoice } from '@/types/character';
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

export interface AliyunImageProcessResponse {
    checkPass: boolean;
    faceBBox: number[];
    extBBox: number[];
}

interface VoiceCloningContextProps {
    voiceName: string;
    setVoiceName: (name: string) => void;
    voiceId: string;
    setVoiceId: (id: string) => void;
    // 修改 language 类型
    language: "中文" | "英语";
    setLanguage: Dispatch<SetStateAction<"中文" | "英语">>;
    // 修改 gender 类型
    gender: "男" | "女";
    setGender: Dispatch<SetStateAction<"男" | "女">>;
    audioUrl: string | null;
    setAudioUrl: (url: string | null) => void;
    avatarUrl: string | null;
    setAvatarUrl: (url: string | null) => void;
    detectionResult: AliyunImageProcessResponse | null;
    setDetectionResult: (result: AliyunImageProcessResponse) => void;
    fileId: number;
    setFileId: (id: number) => void;
    submitData: () => void;
    discardData: () => void;

    // 新增编辑模式相关属性
    isEditMode: boolean;
    setIsEditMode: Dispatch<SetStateAction<boolean>>;
    characterId: string | null;
    setCharacterId: Dispatch<SetStateAction<string | null>>;
    // 设置当前编辑的声音数据
    setEditingVoice: (voice: ClonedVoice) => void;
}

const VoiceCloningContext = createContext<VoiceCloningContextProps | undefined>(undefined);

export const VoiceCloningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [voiceName, setVoiceName] = useState("")
    // 修改 gender 默认值
    const [gender, setGender] = useState<"男" | "女">("男");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    // 修改 language 默认值
    const [language, setLanguage] = useState<"中文" | "英语">("中文");
    const [detectionResult, setDetectionResult] = useState<AliyunImageProcessResponse | null>(null);
    const [voiceId, setVoiceId] = useState("");
    const [fileId, setFileId] = useState(0);

    // 新增编辑模式状态
    const [isEditMode, setIsEditMode] = useState(false);
    const [characterId, setCharacterId] = useState<string | null>(null);
    const submitData = async () => {
        const data = {
            voiceName,
            gender: gender,
            avatarUrl,
            detectionResult,
            audioUrl,
            voiceId,
            language: language,
            fileId,
            // 编辑模式下传递characterId
            ...(isEditMode && characterId ? { characterId } : {})
        };
        try {
            const endpoint = isEditMode ? '/characters/update' : '/characters/create';
            const response = await instance.post(endpoint, data);
            if (response.status !== 200) {
                throw new Error(isEditMode ? '更新数据失败' : '提交数据失败');
            }
            if (response.data.code !== 0) {
                throw new Error(isEditMode ? '更新失败' : '创建失败');
            }
        } catch (error) {
            console.error('提交数据时出错:', error);
        }
    };

    // 设置当前编辑的声音数据
    const setEditingVoice = (voice: ClonedVoice) => {
        setIsEditMode(true);
        setCharacterId(voice.character_id);
        setVoiceName(voice.name);
        setGender(voice.gender as "男" | "女");
        setLanguage(voice.language as "中文" | "英语");
        setAvatarUrl(voice.avatar_url);
        setAudioUrl(voice.audio_url);
        setVoiceId(voice.voice_id);
    };
    // discard data
    const discardData = async () => {
        // 修改默认值
        setLanguage("中文");
        setVoiceName("");
        setGender("男")
        setAudioUrl(null);
        setAvatarUrl(null);
    }

    return (
        <VoiceCloningContext.Provider
            value={{
                voiceName,
                setVoiceName,
                voiceId,
                setVoiceId,
                gender,
                setGender,
                audioUrl,
                setAudioUrl,
                submitData,
                discardData,
                avatarUrl,
                setAvatarUrl,
                detectionResult,
                setDetectionResult,
                fileId,
                setFileId,
                language,
                setLanguage,
                // 新增编辑模式相关属性
                isEditMode,
                setIsEditMode,
                characterId,
                setCharacterId,
                setEditingVoice,
            }}>
            {children}
        </VoiceCloningContext.Provider>
    );
};

export const useVoiceCloning = () => {
    const context = useContext(VoiceCloningContext);
    if (!context) {
        throw new Error('useVoiceCloning must be used within a VoiceCloningProvider');
    }
    return context;
};