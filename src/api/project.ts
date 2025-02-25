// deleteProject
import instance from "@/api/axios"

export function getProjects() {
    // const response = await instance.get("/projects")
    // return response.data
    return [
        {
            id: "1",
            name: "Project 1",
            image: "/placeholder.svg?height=200&width=400",
            updatedAt: new Date().toISOString()
        },
        {
            id: "2",
            name: "Project 2",
            image: "/placeholder.svg?height=200&width=400",
            updatedAt: new Date().toISOString()
        },
        {
            id: "3",
            name: "Project 3",
            image: "/placeholder.svg?height=200&width=400",
            updatedAt: new Date().toISOString()
        },
    ]
}

export async function deleteProject(id: string) {
    await instance.delete(`/projects/${id}`)
    // revalidatePath("/projects")
}