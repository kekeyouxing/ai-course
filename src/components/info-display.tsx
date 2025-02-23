interface InfoDisplayProps {
    image: string
    name: string
}

export function InfoDisplay({image, name}: InfoDisplayProps) {
    return (
        <div className="flex items-center space-x-4 p-4 border-b w-full">
            <img src={image || "/placeholder.svg"} alt={name} width={50} height={50} className="rounded-md"/>
            <h2 className="text-lg font-semibold">{name}</h2>
        </div>
    )
}

