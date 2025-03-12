import {Suspense, useState} from "react"
import ProjectCard from "@/components/project/project-card"
import {getProjects} from "@/api/project"
import {ProjectCreationModal} from "@/app/project-creation-modal.tsx";
import { Briefcase } from "lucide-react";

export default function ProjectCollectionPage() {
    const projects = getProjects()
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateProject = (name: string, file: File | null) => {
        console.log("Project Name:", name);
        console.log("Uploaded File:", file);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div onClick={() => setIsModalOpen(true)}
                className="rounded-xl w-80 p-6 flex flex-col bg-gradient-to-br from-purple-500 via-purple-400 to-amber-700 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:brightness-110 active:scale-95"
            >
                <div className="mb-6">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white"/>
                    </div>
                </div>
                <div className="mt-auto">
                    <h3 className="text-2xl font-bold text-white mb-2">创建项目</h3>
                    <p className="text-white/90">你可以新建空白项目，或导入PPT创建项目</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
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

