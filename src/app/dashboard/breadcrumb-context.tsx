// contexts/breadcrumb-context.tsx
import {createContext, useContext, useState} from "react"

type BreadcrumbItem = {
    title: string
    path: string
}

type BreadcrumbContextType = {
    breadcrumbs: BreadcrumbItem[]
    setBreadcrumbs: (items: BreadcrumbItem[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
    breadcrumbs: [],
    setBreadcrumbs: () => {
    }
})

export const BreadcrumbProvider = ({children}: { children: React.ReactNode }) => {
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

    return (
        <BreadcrumbContext.Provider value={{breadcrumbs, setBreadcrumbs}}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

export const useBreadcrumb = () => useContext(BreadcrumbContext)
