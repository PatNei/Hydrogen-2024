import React from "react"

type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>

export const P = React.forwardRef<HTMLParagraphElement,ParagraphProps>(
function P(props,ref) {
    return <p {...props} ref={ref} className={`lowercase ${props.className}`} />
}    
)