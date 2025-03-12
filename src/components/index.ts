// Layout components
export { AppSidebar } from './layout/app-sidebar';
export { HeaderBreadcrumb } from './layout/header-breadcrumb';
export { NavHome } from './layout/nav-home';
export { NavMain } from './layout/nav-main';
export { NavProjects } from './layout/nav-projects';
export { NavUser } from './layout/nav-user';

// Editor components
export { default as CustomEditor } from './editor/custom-editor';
export { default as ScriptContent } from './editor/script-content';
export { ScriptReader } from './editor/script-reader';
export { TextEditor } from './editor/text-editor';
export { default as TimePicker } from './editor/time-picker';

// Video components
export { BackgroundContent } from './video/background-content';
export { VideoHeader } from './video/video-header';
export { VideoPreview } from './video/video-preview';
export { VideoRecorder } from './video/video-recorder';
export { VideoTabs } from './video/video-tabs';
export { VideoTimeline } from './video/video-timeline';

// Avatar components
export { default as AvatarContent } from './avatar/avatar-content';
export { ResizableAvatar } from './media/resizable-avatar';

// Voice components
export { default as VoiceCloningUI } from './voice/voice-cloning-ui';
export { default as VoiceOptionScreen } from './voice/voice-option-screen';

// Media components
export { default as ImageUploadScreen } from './media/image-upload-screen';
export { ResizableImage } from './media/resizable-image';
export { ResizableText } from './media/resizable-text';
export { default as UploadScreen } from './media/upload-screen';

// Auth components
export { default as AuthRoute } from './auth/AuthRoute';

// Project components
export { default as ProjectCard } from './project/project-card';

// Recording components
export { default as RecordingScreen } from './recording/RecordingScreen';
export { default as RecordingSetup } from './recording/recording-setup';

// Common components
export { default as FeatureCards } from './common/feature-cards';
export { getBreadcrumbs } from './common/getBreadcrumbs';
export { InfoDisplay } from './common/info-display';
export { InputSend } from './common/input-send';
export { default as LanguageSwitcher } from './common/language-switcher';
export { OperationFunctions } from './common/operation-functions';