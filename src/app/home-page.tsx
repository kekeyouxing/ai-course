import FeatureCards from "@/components/common/feature-cards";
// import Image from "next/image"

export default function HomePage() {
    return (
        <div className="mx-60 px-4 py-12">
            <div className="mb-8">
                <h1 className="text-muted-foreground font-bold mb-2">My Workspace</h1>
                <p className="text-4xl font-extrabold font">
                    Good{" "}
                    {new Date().getHours() < 12 ? "Morning" :
                        new Date().getHours() < 18 ? "Afternoon" : "Evening"}
                </p>
            </div>
            <div>
                <FeatureCards/>
            </div>
        </div>
    )
}

