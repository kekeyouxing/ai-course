import {Suspense, useState} from "react"
import ProjectCard from "@/components/project-card.tsx"
import {getProjects} from "@/api/project"
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Plus} from "lucide-react";
import {ProjectCreationModal} from "@/app/project-creation-modal.tsx";

export default function ProjectCollectionPage() {
    const projects = getProjects()
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateProject = (name: string, file: File | null) => {
        console.log("Project Name:", name);
        console.log("Uploaded File:", file);
        // Implement your project creation logic here
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between mb-8">
                <Input
                    type="search"
                    placeholder="Search projects..."
                    className="w-full max-w-md"
                />
                <Button
                    className="ml-4"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus/>创建项目
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Suspense fallback={<div>Loading projects...</div>}>
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project}/>
                    ))}
                </Suspense>
            </div>
            <ProjectCreationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </div>
    )
}

