import { Await, NavLink } from "@remix-run/react";
import { Suspense } from "react";
import type {
	CartApiQueryFragment,
	HeaderQuery,
} from "storefrontapi.generated";
import type { LayoutProps } from "./Layout";
import { useRootLoaderData } from "~/lib/root-data";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { SlBag } from "react-icons/sl";

type HeaderProps = Pick<LayoutProps, "header" | "cart" | "isLoggedIn">;

type Viewport = "desktop" | "mobile";

export function getHeaderNavLinkStyle({
	isActive,
	isPending,
}: { isActive: boolean; isPending: boolean }) {
	if (isPending) return "text-green-500";
	if (isActive) return "text-purple-700";
	return "";
}

export function Header({ header, isLoggedIn, cart }: HeaderProps) {
	const { shop, menu } = header;
	const primaryDomainUrl = header.shop.primaryDomain.url;
	const { publicStoreDomain } = useRootLoaderData();

	return (
		<div className="flex">
			<NavigationMenu className="min-w-full max-w-full h-full flex content-start justify-between sm:pl-12">
				<NavigationMenuList className="flex flex-col w-full content-start text-start justify-start">
					<NavigationMenuItem className="w-full">
						<NavigationMenuLink>
							<NavLink
								prefetch="intent"
								to="/"
								className={getHeaderNavLinkStyle}
								end
							>
								{({ isActive, isPending }) => {
									if (isPending) return <p className="underline">Loading..</p>;
									if (isActive)
										return (
											<p className="underline text-purple-700">{shop.name}</p>
										);
									return <p className="underline">{shop.name}</p>; // TODO: Remove this
								}}
							</NavLink>
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem className="">
						<p>Some text</p>
					</NavigationMenuItem>
					<NavigationMenuItem className="flex w-full justify-between">
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
								<NavigationMenuLink key={`nml-${item.id}`}>
									<NavLink
										className={getHeaderNavLinkStyle}
										end
										key={item.id}
										prefetch="intent"
										to={url}
									>
										<p className="underline font-extralight">{item.title}</p>
									</NavLink>
								</NavigationMenuLink>
							);
						})}
					</NavigationMenuItem>
				</NavigationMenuList>
				<NavigationMenuList className="flex w-full h-full">
					<NavigationMenuItem>
						<CartMenu cart={cart} />
					</NavigationMenuItem>
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
		</div>
	);
}

export const CartMenu = ({
	cart,
}: { cart: Promise<CartApiQueryFragment | null> }) => {
	return (
		<Popover>
			<PopoverTrigger>
				<Suspense fallback={<CartIcon />}>
					<Await resolve={cart}>
						{(cart) => {
							if (!cart) return <CartIcon />;
							// return <CartBadge count={cart.totalQuantity || 0} />;
							return <CartIcon />;
						}}
					</Await>
				</Suspense>
			</PopoverTrigger>
			<PopoverContent className="mr-[5dvw] mt-4 max-h-[80dvh]">
				<Suspense fallback={<div>The cart is empty...</div>}>
					<Await resolve={cart}>
						{(cart) => {
							if (!cart) return <div>The cart is empty...</div>;
							cart.lines.nodes.map((line) => {
								<div>{line.merchandise.title}</div>;
							});
						}}
					</Await>
				</Suspense>
			</PopoverContent>
		</Popover>
	);
};

const CartIcon = () => {
	return <SlBag className="w-8 h-8" />;
};

export const CartItem = () => {
	return (
		<>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card Description</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card Content</p>
			</CardContent>
			<CardFooter>
				<p>Card Footer</p>
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
						className="header-menu-item"
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

function HeaderCtas({
	isLoggedIn,
	cart,
}: Pick<HeaderProps, "isLoggedIn" | "cart">) {
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
