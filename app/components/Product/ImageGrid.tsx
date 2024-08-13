import type { ReactNode } from "react"

type ImageGridProps = {
    children: ReactNode
    className?: string
}

export const ImageGrid = ({children,className}:ImageGridProps) => {

    return <div className={`flex flex-col w-full h-full ${className}`}>
        {children}
        </div>

}
