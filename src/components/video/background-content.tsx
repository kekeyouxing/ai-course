export function BackgroundContent() {
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Choose a Background</h2>
            <div className="grid grid-cols-2 gap-4">
                {/* Add background options here */}
                <div className="border p-2 rounded cursor-pointer hover:bg-gray-100">Background 1</div>
                <div className="border p-2 rounded cursor-pointer hover:bg-gray-100">Background 2</div>
                {/* ... more backgrounds ... */}
            </div>
        </div>
    )
}

