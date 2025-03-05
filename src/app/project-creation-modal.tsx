import {useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {UploadCloud} from "lucide-react";

//
interface ProjectCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, file: File | null) => void;
}

export function ProjectCreationModal({isOpen, onClose}: ProjectCreationModalProps) {
    const [projectName, setProjectName] = useState("");
    // 处理文件上传
    const handleFileUpload = () => {
        // const file = event.target.files[0];
        // if (file && file.size <= 10 * 1024 * 1024) { // 限制上传最大文件为 10MB
        //     setAudioFile(file);
        //     setAudioDuration(0);
        // } else {
        //     alert("文件大小超过限制，请上传小于10MB的文件。");
        // }
    };
    const handleCreate = () => {
        // onCreate(projectName, file);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                    <label htmlFor="file-upload"
                           className="space-y-4 rounded-lg bg-gray-50 cursor-pointer text-center h-80 border-dashed border-2 flex flex-col items-center justify-center">
                        <UploadCloud className="w-8 h-8 mb-2"/>
                        <p>点击或者拖拽上传ppt</p>
                        <p className="text-xs text-gray-500">单个文件最大50MB</p>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".ppt,.pptx"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>
                <DialogFooter>
                    <Button className={"cursor-pointer"} onClick={handleCreate}>创建</Button>
                    <Button className={"cursor-pointer"} variant="secondary" onClick={onClose}>取消</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}