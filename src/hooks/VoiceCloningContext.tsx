// src/context/VoiceCloningContext.tsx
import instance from '@/api/axios';
import React, {createContext, Dispatch, SetStateAction, useContext, useState} from 'react';

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
}

const VoiceCloningContext = createContext<VoiceCloningContextProps | undefined>(undefined);

export const VoiceCloningProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
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
    const submitData = async () => {
        // 在提交数据时进行映射转换，保持API兼容性
        const apiGender = gender === "男" ? "male" : "female";
        const apiLanguage = language === "中文" ? "chinese" : "english";
        
        const data = {
            voiceName, 
            gender: apiGender, 
            avatarUrl, 
            detectionResult, 
            audioUrl, 
            voiceId, 
            language: apiLanguage, 
            fileId
        };
        try {
            const response = await instance.post('/characters/create', data);
            if (response.status !== 200) {
                throw new Error('提交数据失败');
            }
            if (response.data.code !== 0) {
                throw new Error('创建失败');
            }
            console.log('数据提交成功');
        } catch (error) {
            console.error('提交数据时出错:', error);
        }
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