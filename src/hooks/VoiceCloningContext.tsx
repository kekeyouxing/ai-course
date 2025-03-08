// src/context/VoiceCloningContext.tsx
import React, {createContext, Dispatch, SetStateAction, useContext, useState} from 'react';

interface VoiceCloningContextProps {
    voiceName: string;
    setVoiceName: (name: string) => void;
    language: "chinese" | "english";
    setLanguage: Dispatch<SetStateAction<"chinese" | "english">>;
    gender: "male" | "female";
    setGender: Dispatch<SetStateAction<"male" | "female">>;
    audioUrl: string | null;
    setAudioUrl: (url: string | null) => void;
    avatarUrl: string | null;
    setAvatarUrl: (url: string | null) => void;
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
    const submitData = async () => {
        const data = {voiceName, gender, avatarUrl};
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to submit data');
            }
            console.log('Data submitted successfully');
        } catch (error) {
            console.error('Error submitting data:', error);
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
                gender,
                setGender,
                audioUrl,
                setAudioUrl,
                submitData,
                discardData,
                avatarUrl,
                setAvatarUrl,
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