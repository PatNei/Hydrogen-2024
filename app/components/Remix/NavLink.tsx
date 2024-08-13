import { NavLink as _NavLink } from "@remix-run/react";
import type { RemixNavLinkProps } from "@remix-run/react/dist/components";
import React from "react";
import { P } from "../Default/P";

type NavLinkProps = RemixNavLinkProps & {to:string} & React.HTMLAttributes<HTMLAnchorElement> & React.RefAttributes<HTMLAnchorElement>

export const NavLinkP = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink(props, ref) {
    return <_NavLink className="text-slate-500" {...props} ref={ref} >{({isPending,isActive,isTransitioning}) => (
      <P isActive={isActive} isPending={isPending} isTransitioning={isTransitioning}>{props.children}</P>
)}
    </_NavLink>;
  }
)

