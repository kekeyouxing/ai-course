// src/context/VoiceCloningContext.tsx
import instance from '@/api/axios';
import React, {createContext, Dispatch, SetStateAction, useContext, useState} from 'react';
interface AliyunImageProcessResponse {
    checkPass: boolean;
    faceBBox: number[];
    extBBox: number[];
}

interface VoiceCloningContextProps {
    voiceName: string;
    setVoiceName: (name: string) => void;
    voiceId: string;
    setVoiceId: (id: string) => void;
    language: "chinese" | "english";
    setLanguage: Dispatch<SetStateAction<"chinese" | "english">>;
    gender: "male" | "female";
    setGender: Dispatch<SetStateAction<"male" | "female">>;
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
    const [gender, setGender] = useState<"male" | "female">("male");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [language, setLanguage] = useState<"chinese" | "english">("chinese");
    const [detectionResult, setDetectionResult] = useState<AliyunImageProcessResponse | null>(null);
    const [voiceId, setVoiceId] = useState("");
    const [fileId, setFileId] = useState(0);
    const submitData = async () => {
        const data = {voiceName, gender, avatarUrl, detectionResult, audioUrl, voiceId, language, fileId};
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
        setLanguage("chinese");
        setVoiceName("");
        setGender("male")
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