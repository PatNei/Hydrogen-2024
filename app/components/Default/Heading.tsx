import React from "react"
import type { FC } from "react"
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>

  export const H1 = React.forwardRef<HTMLHeadingElement,HeadingProps>(
    function H1(props,ref) {
        return <h1 {...props} ref={ref} className="text-slate-600 text-xxl" />
    }    
    )
  export const H2 = React.forwardRef<HTMLHeadingElement,HeadingProps>(
    function H2(props,ref) {
        return <h1 {...props} ref={ref} className="text-slate-600 text-xl" />
    }    
    )