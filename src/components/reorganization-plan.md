# Components Directory Reorganization Plan

This document outlines the plan for reorganizing the components directory to improve code organization and maintainability.

## New Directory Structure

```
components/
├── ui/                  (existing - UI components)
├── layout/             (navigation and layout components)
│   ├── app-sidebar.tsx
│   ├── header-breadcrumb.tsx
│   ├── nav-home.tsx
│   ├── nav-main.tsx
│   ├── nav-projects.tsx
│   ├── nav-user.tsx
│   ├── sidebar.tsx
├── editor/             (editor-related components)
│   ├── custom-editor.tsx
│   ├── script-content.tsx
│   ├── script-reader.tsx
│   ├── text-editor.tsx
│   ├── time-picker.tsx
├── video/              (video-related components)
│   ├── background-content.tsx
│   ├── video-header.tsx
│   ├── video-preview.tsx
│   ├── video-recorder.tsx
│   ├── video-tabs.tsx
│   ├── video-timeline.tsx
├── avatar/             (avatar-related components)
│   ├── avatar-content.tsx
│   ├── resizable-avatar.tsx
├── voice/              (voice-related components)
│   ├── voice-cloning-ui.tsx
│   ├── voice-option-screen.tsx
├── media/              (media-related components)
│   ├── image-upload-screen.tsx
│   ├── resizable-image.tsx
│   ├── resizable-text.tsx
│   ├── upload-screen.tsx
├── auth/               (authentication components)
│   ├── AuthRoute.tsx
├── project/            (project-related components)
│   ├── project-card.tsx
├── recording/          (recording-related components)
│   ├── RecordingScreen.tsx
│   ├── recording-setup.tsx
├── common/             (other common components)
│   ├── feature-cards.tsx
│   ├── getBreadcrumbs.ts
│   ├── info-display.tsx
│   ├── input-send.tsx
│   ├── language-switcher.tsx
│   ├── operation-functions.tsx
```

## Implementation Strategy

1. Create the new directory structure
2. Move files to their respective directories
3. Update imports in the moved files
4. Test the application to ensure everything works correctly

## Import Path Considerations

The current project uses absolute imports with the `@/components/` prefix. When moving files, we need to ensure that:

1. Imports within the moved files are updated to reflect their new locations
2. Files that import the moved components continue to work

We have two options:

### Option 1: Update all imports throughout the project

This would involve changing imports like:
```typescript
import TimePicker from "@/components/time-picker"
```
to:
```typescript
import TimePicker from "@/components/editor/time-picker"
```

### Option 2: Create barrel files (index.ts) in each directory

This would allow us to maintain the current import paths by re-exporting components from their new locations:

```typescript
// components/index.ts
export { default as TimePicker } from "./editor/time-picker";
```

For this reorganization, we'll use Option 2 to minimize changes to the codebase and reduce the risk of breaking existing functionality.