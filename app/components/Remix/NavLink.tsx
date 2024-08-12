import { NavLink as _NavLink } from "@remix-run/react";
import type { RemixNavLinkProps } from "@remix-run/react/dist/components";
import React from "react";
import { P } from "../Default/P";

type NavLinkProps = RemixNavLinkProps & {to:string} & React.HTMLAttributes<HTMLAnchorElement> & React.RefAttributes<HTMLAnchorElement>

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink(props, ref) {
    return <_NavLink discover="render" className={({isActive, isPending}) => {
        return ` text-slate-500 ${isActive ? 'underline' : ""}`
    }} {...props} ref={ref} ><P>{props.children}</P></_NavLink>;
  }
)