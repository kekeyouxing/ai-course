import {Button} from "@/components/ui/button"
import {Mic, PlusCircle, Scissors} from "lucide-react"

export function OperationFunctions() {
    return (
        <div className="flex justify-between items-center p-4 border-b">
            <Button variant="outline" size="sm">
                <Mic className="mr-2 h-4 w-4"/>
                Generate Voice
            </Button>
            <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Insert
                </Button>
                <Button variant="outline" size="sm">
                    <Scissors className="mr-2 h-4 w-4"/>
                    Break
                </Button>
            </div>
        </div>
    )
}

