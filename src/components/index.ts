// Layout components
export { AppSidebar } from './layout/app-sidebar';
export { HeaderBreadcrumb } from './layout/header-breadcrumb';
export { NavHome } from './layout/nav-home';
export { NavMain } from './layout/nav-main';
export { NavProjects } from './layout/nav-projects';
export { NavUser } from './layout/nav-user';

// Editor components
export { default as CustomEditor } from './script/custom-editor';
export { default as ScriptContent } from './script/script-content';
export { ScriptReader } from './clone/script-reader';
export { default as TimePicker } from './script/time-picker';

// Video components
export { BackgroundContent } from './background/background-content';
export { VideoHeader } from './workspace/workspace-header';
export { VideoRecorder } from './clone/video-recorder';
export { VideoTabs } from './workspace/workspace-tabs';
export { VideoTimeline } from './workspace/workspace-timeline';

// Avatar components
export { default as AvatarContent } from './avatar/avatar-content';
export { ResizableAvatar } from './workspace/resizable-avatar';

// Voice components
export { default as VoiceCloningUI } from './clone/voice-cloning-ui';
export { default as VoiceOptionScreen } from './clone/voice-option-screen';

// Media components
export { default as ImageUploadScreen } from './media/image-upload-screen';
export { ResizableImage } from './workspace/resizable-image';
export { ResizableText } from './workspace/resizable-text';
export { default as UploadScreen } from './media/upload-screen';

// Auth components
export { default as AuthRoute } from './auth/AuthRoute';

// Project components
export { default as ProjectCard } from './project/project-card';

// Recording components
export { default as RecordingScreen } from './clone/RecordingScreen';
export { default as RecordingSetup } from './clone/recording-setup';

// Common components
export { default as FeatureCards } from './common/feature-cards';
export { getBreadcrumbs } from './common/getBreadcrumbs';
export { InfoDisplay } from './common/info-display';
export { InputSend } from './common/input-send';
export { default as LanguageSwitcher } from './common/language-switcher';
export { OperationFunctions } from './common/operation-functions';