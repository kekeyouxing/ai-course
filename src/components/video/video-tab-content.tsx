import React from 'react';
import ScriptContent from "@/components/script/script-content";
import AvatarContent from "@/components/avatar/avatar-content";
import { BackgroundContent } from "@/components/background/background-content";
import TextContent from "@/components/text/text-content";
import MediaContent from "@/components/media/media-content";
import { Scene, SelectedElementType, Background } from '@/types/scene';

interface VideoTabContentProps {
  activeTab: string;
  scenes: Scene[];
  activeScene: number;
  selectedElement: SelectedElementType | null;
  handleScriptUpdate: (newScript: string) => void;
  handleSelectAvatar: (avatarSrc: string) => void;
  handleBackgroundChange: (background: Background) => void;
  handleTextUpdate: (newProps: any) => void;
  handleImageUpdate: (mediaId: string, updates: any) => void;
  handleVideoUpdate: (mediaId: string, updates: any) => void;
  handleAddMedia: (mediaItem: any) => void;
  getSelectedMedia: () => any;
  handleDeleteElement: () => void;
}

export const VideoTabContent: React.FC<VideoTabContentProps> = ({
  activeTab,
  scenes,
  activeScene,
  selectedElement,
  handleScriptUpdate,
  handleSelectAvatar,
  handleBackgroundChange,
  handleTextUpdate,
  handleImageUpdate,
  handleVideoUpdate,
  handleAddMedia,
  getSelectedMedia,
  handleDeleteElement
}) => {
  // Render content based on active tab
  switch (activeTab) {
    case "Script":
      return (
        <ScriptContent
          script={scenes[activeScene].script || ""}
          setScript={handleScriptUpdate}
        />
      );
    case "Avatar":
      return (
        <AvatarContent
          onSelectAvatar={handleSelectAvatar}
        />
      );
    case "Background":
      return (
        <BackgroundContent
          currentBackground={scenes[activeScene].background}
          onBackgroundChange={handleBackgroundChange}
        />
      );
    case "Text":
      return (
        <TextContent
          textElement={
            selectedElement?.type === "text" && 
            selectedElement.index !== undefined &&
            Array.isArray(scenes[activeScene].texts) && 
            selectedElement.index < scenes[activeScene].texts.length
              ? scenes[activeScene].texts[selectedElement.index]
              : undefined
          }
          onUpdate={handleTextUpdate}
          currentSceneId={scenes[activeScene].id}
        />
      );
    case "Media":
      return (
        <MediaContent
          onAddMedia={handleAddMedia}
          onUpdateImage={handleImageUpdate}
          onUpdateVideo={handleVideoUpdate}
          selectedMedia={getSelectedMedia()}
          currentSceneId={scenes[activeScene].id}
          onDelete={handleDeleteElement}
        />
      );
    default:
      return <div>Content for {activeTab}</div>;
  }
};