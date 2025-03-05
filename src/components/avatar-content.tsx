export function AvatarContent() {
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Choose an Avatar</h2>
            <div className="grid grid-cols-2 gap-4">
                {/* Add avatar options here */}
                <div className="border p-2 rounded cursor-pointer hover:bg-gray-100">Avatar 1</div>
                <div className="border p-2 rounded cursor-pointer hover:bg-gray-100">Avatar 2</div>
                {/* ... more avatars ... */}
            </div>
        </div>
    )
}

