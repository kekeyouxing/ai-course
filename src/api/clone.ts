import instance from '@/api/axios'
import {v4 as uuidv4} from 'uuid';

export async function generatePresignedURL() {
    const objectKey = uuidv4(); // Generate a unique objectKey
    try {
        const response = await instance.get(`/generatePresignedURL`, {
            params: {objectKey}
        })
        return response.data
    } catch (error) {
        console.error('Error generating presigned URL:', error)
        throw error
    }
}

export async function addCharacter(
    name: string,
    language: string,
    gender: string,
    videoUrl: string,
    characterName: string,
    characterDescription: string
) {
    const data = {gender, videoUrl, characterName, characterDescription};
    try {
        const response = await instance.post(`/characters/create`, data)
        return response.data
    } catch (error) {
        console.error('Error adding character:', error)
        throw error
    }
}
