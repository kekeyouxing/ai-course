""

import {useState} from "react"
import {Card, CardContent, CardFooter} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {deleteProject} from "@/api/project"
import {Link} from "react-router-dom"
import {Trash} from "lucide-react";

interface ProjectCardProps {
    project: {
        id: string
        name: string
        image: string
        updatedAt: string
    }
}

export default function ProjectCard({project}: ProjectCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteProject(project.id)
            // You might want to refresh the project list or remove the card from the UI here
        } catch (error) {
            console.error("Failed to delete project:", error)
            setIsDeleting(false)
        }
    }

    return (
        <Card className="relative">
            <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={handleDelete}
                disabled={isDeleting}
            >
                <Trash/>
            </Button>
            <Link to={`/projects/${project.id}`}>
                <CardContent className="p-0">
                    <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.name}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover"
                    />
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-500">Updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
                </CardFooter>
            </Link>
        </Card>
    )
}

