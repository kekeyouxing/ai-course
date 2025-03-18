"use client"

import { createContext, useContext, useState, ReactNode } from 'react';

// 动画标记数据结构
export interface AnimationMarker {
  id: string;
  name: string;
  timePercent: number;
  description?: string;
  sceneId?: string; // 添加场景ID关联
}

interface AnimationMarkersContextType {
  markers: AnimationMarker[];
  addMarker: (marker: AnimationMarker) => void;
  updateMarker: (id: string, marker: Partial<AnimationMarker>) => void;
  removeMarker: (id: string) => void;
  getMarkerById: (id: string) => AnimationMarker | undefined;
  getMarkersBySceneId: (sceneId: string) => AnimationMarker[];
  setCurrentSceneId: (sceneId: string) => void;
}

const AnimationMarkersContext = createContext<AnimationMarkersContextType | undefined>(undefined);

export function AnimationMarkersProvider({ children }: { children: ReactNode }) {
  const [markers, setMarkers] = useState<AnimationMarker[]>([]);
  const [currentSceneId, setCurrentSceneId] = useState<string>('');

  // 添加标记时自动关联到当前场景
  const addMarker = (marker: AnimationMarker) => {
    // 简化逻辑，移除计数相关代码
    const sceneId = marker.sceneId || currentSceneId;
    
    const newMarker = {
      ...marker,
      sceneId: sceneId
    };
    
    setMarkers(prev => [...prev, newMarker]);
  };

  const updateMarker = (id: string, updates: Partial<AnimationMarker>) => {
    setMarkers(prev => 
      prev.map(marker => 
        marker.id === id ? { ...marker, ...updates } : marker
      )
    );
  };

  const removeMarker = (id: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  };

  const getMarkerById = (id: string) => {
    return markers.find(marker => marker.id === id);
  };
  
  // 添加按场景ID获取标记的方法
  const getMarkersBySceneId = (sceneId: string) => {
    return markers.filter(marker => marker.sceneId === sceneId);
  };

  return (
    <AnimationMarkersContext.Provider 
      value={{ 
        markers, 
        addMarker, 
        updateMarker, 
        removeMarker, 
        getMarkerById,
        getMarkersBySceneId,
        setCurrentSceneId
      }}
    >
      {children}
    </AnimationMarkersContext.Provider>
  );
}

export function useAnimationMarkers() {
  const context = useContext(AnimationMarkersContext);
  if (context === undefined) {
    throw new Error('useAnimationMarkers must be used within an AnimationMarkersProvider');
  }
  return context;
}