import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Await, Link } from "@remix-run/react";
import { Suspense } from "react";
import type { HeaderQuery } from "storefrontapi.generated";
import { useRootLoaderData } from "~/lib/root-data";
import type { LayoutProps } from "./Layout";

import {
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { useOptimisticCart } from "@shopify/hydrogen";
import { CartButton, CartMenu } from "../Cart/CartPopover";
import { NavLink } from "../Remix/NavLink";
import { P } from "../Default/P";

type HeaderProps = Pick<LayoutProps, "header" | "cart">;

type Viewport = "desktop" | "mobile";

export function getHeaderNavLinkStyle({
	isActive,
	isPending,
}: { isActive: boolean; isPending: boolean }) {
	if (isPending) return "text-green-500";
	if (isActive) return "text-purple-700";
	return "";
}

export function Header({
	header,
	cart,
	className,
}: HeaderProps & { className?: string }) {
	const { shop, menu } = header;
	const primaryDomainUrl = header.shop.primaryDomain.url;
	const { publicStoreDomain } = useRootLoaderData();
	const optimisticCart = useOptimisticCart(cart);
	const pages = [{ title: "collections", url: "collections" }];
	return (
		<nav className={`min-w-full max-h-[12dvh] max-w-full ${className}`}>
			<NavigationMenu className="min-w-full max-w-full h-full flex content-start justify-between">
				<NavigationMenuList className="flex flex-col content-start text-start justify-start">
					<NavigationMenuItem>
						<NavigationMenuLink>
							<NavLink
								prefetch="intent"
								to="/"
								end
							>
								{shop.name}
							</NavLink>
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavLink to={"/cart"}>
							<CartButton cart={cart} />
						</NavLink>
					</NavigationMenuItem>
					<NavigationMenuItem className="flex gap-2">
						{pages.map((page) => {
							return (
									<NavLink end key={page.title} prefetch="intent" to={page.url}>
										{page.title}
									</NavLink>
							);
						})}
						{(menu || FALLBACK_HEADER_MENU).items.map((item) => {
							if (!item.url) return null;

							// if the url is internal, we strip the domain
							const url =
								item.url.includes("myshopify.com") ||
								item.url.includes(publicStoreDomain) ||
								item.url.includes(primaryDomainUrl)
									? new URL(item.url).pathname
									: item.url;
							if (url === "/") return;
							return (
									<NavLink end key={item.id} prefetch="intent" to={url}>
											{item.title.toLowerCase()}
									</NavLink>
							);
						})}
					</NavigationMenuItem>
				</NavigationMenuList>
				<NavigationMenuList className="flex">

				</NavigationMenuList>
			</NavigationMenu>
			{/* 
			<header className="header">
				<HeaderMenu
					menu={menu}
					viewport="desktop"
					primaryDomainUrl={header.shop.primaryDomain.url}
				/>
				<HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
			</header> */}
		</nav>
	);
}

export const CartItem = () => {
	return (
		<>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card Description</CardDescription>
			</CardHeader>
			<CardContent>
				<P>Card Content</P>
			</CardContent>
			<CardFooter>
				<P>Card Footer</P>
			</CardFooter>
		</>
	);
};

export function HeaderMenu({
	menu,
	primaryDomainUrl,
	viewport,
}: {
	menu: HeaderProps["header"]["menu"];
	primaryDomainUrl: HeaderQuery["shop"]["primaryDomain"]["url"];
	viewport: Viewport;
}) {
	const { publicStoreDomain } = useRootLoaderData();
	const className = `header-menu-${viewport}`;

	function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
		if (viewport === "mobile") {
			event.preventDefault();
			window.location.href = event.currentTarget.href;
		}
	}

	return (
		<nav className={className} role="navigation">
			{viewport === "mobile" && (
				<NavLink
					end
					onClick={closeAside}
					prefetch="intent"
					style={activeLinkStyle}
					to="/"
				>
					Home
				</NavLink>
			)}
			{(menu || FALLBACK_HEADER_MENU).items.map((item) => {
				if (!item.url) return null;

				// if the url is internal, we strip the domain
				const url =
					item.url.includes("myshopify.com") ||
					item.url.includes(publicStoreDomain) ||
					item.url.includes(primaryDomainUrl)
						? new URL(item.url).pathname
						: item.url;
				return (
					<NavLink
						className=""
						end
						key={item.id}
						onClick={closeAside}
						prefetch="intent"
						style={activeLinkStyle}
						to={url}
					>
						{item.title}
					</NavLink>
				);
			})}
		</nav>
	);
}

function HeaderCtas({ cart }: Pick<HeaderProps, "cart">) {
	return (
		<nav className="header-ctas">
			{/* <HeaderMenuMobileToggle />
			<NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
				<Suspense fallback="Sign in">
					<Await resolve={isLoggedIn} errorElement="Sign in">
						{(isLoggedIn) => (isLoggedIn ? "Account" : "Sign in")}
					</Await>
				</Suspense>
			</NavLink> */}
			<SearchToggle />
			<CartToggle cart={cart} />
		</nav>
	);
}

function HeaderMenuMobileToggle() {
	return (
		<a className="header-menu-mobile-toggle" href="#mobile-menu-aside">
			<h3>☰</h3>
		</a>
	);
}

function SearchToggle() {
	return <a href="#search-aside">Search</a>;
}

function CartBadge({ count }: { count: number }) {
	return <a href="#cart-aside">Cart {count}</a>;
}

function CartToggle({ cart }: Pick<HeaderProps, "cart">) {
	return (
		<Suspense fallback={<CartBadge count={0} />}>
			<Await resolve={cart}>
				{(cart) => {
					if (!cart) return <CartBadge count={0} />;
					return <CartBadge count={cart.totalQuantity || 0} />;
				}}
			</Await>
		</Suspense>
	);
}

const FALLBACK_HEADER_MENU = {
	id: "gid://shopify/Menu/199655587896",
	items: [
		{
			id: "gid://shopify/MenuItem/461609500728",
			resourceId: null,
			tags: [],
			title: "Collections",
			type: "HTTP",
			url: "/collections",
			items: [],
		},
		{
			id: "gid://shopify/MenuItem/461609533496",
			resourceId: null,
			tags: [],
			title: "Blog",
			type: "HTTP",
			url: "/blogs/journal",
			items: [],
		},
		{
			id: "gid://shopify/MenuItem/461609566264",
			resourceId: null,
			tags: [],
			title: "Policies",
			type: "HTTP",
			url: "/policies",
			items: [],
		},
		{
			id: "gid://shopify/MenuItem/461609599032",
			resourceId: "gid://shopify/Page/92591030328",
			tags: [],
			title: "About",
			type: "PAGE",
			url: "/pages/about",
			items: [],
		},
	],
};

function activeLinkStyle({
	isActive,
	isPending,
}: {
	isActive: boolean;
	isPending: boolean;
}) {
	return {
		fontWeight: isActive ? "bold" : undefined,
		color: isPending ? "grey" : "black",
	};
}
