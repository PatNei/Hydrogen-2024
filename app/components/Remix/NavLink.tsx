import { NavLink as _NavLink } from "@remix-run/react";
import type { RemixNavLinkProps } from "@remix-run/react/dist/components";
import React from "react";

type NavLinkProps = RemixNavLinkProps & {to:string} & React.RefAttributes<HTMLAnchorElement>

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink(props, ref) {
    return <_NavLink className={({isActive, isPending}) => {
        return `visited:text-slate-500 ${isActive ? 'underline' : ""}`
    }} {...props} ref={ref} />;
  }
)