import { Await, NavLink } from "@remix-run/react";
import { Suspense } from "react";
import type {
	CartApiQueryFragment,
	FooterQuery,
	HeaderQuery,
} from "storefrontapi.generated";
import { Aside } from "~/components/Aside";
import { Footer } from "~/components/Footer";
import { Header, HeaderMenu, getHeaderNavLinkStyle } from "~/components/Header";
import { CartMain } from "~/components/Cart";
import {
	PredictiveSearchForm,
	PredictiveSearchResults,
} from "~/components/Search";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { FaQuestion } from "react-icons/fa6";

export type LayoutProps = {
	cart: Promise<CartApiQueryFragment | null>;
	children?: React.ReactNode;
	footer: Promise<FooterQuery>;
	header: HeaderQuery;
	isLoggedIn: Promise<boolean>;
};

export function Layout({
	cart,
	children = null,
	footer,
	header,
	isLoggedIn,
}: LayoutProps) {
	return (
		<>
			{/* <CartAside cart={cart} />
			<SearchAside />
			<MobileMenuAside menu={header?.menu} shop={header?.shop} /> */}
			<div className="flex pt-[10px] gap-2 mt-12 px-2 flex-row max-w-screen min-w-screen w-screen">
				<div className="flex min-w-[5dvw] w-[5dvw] max-w-[5dvw] sm:max-w-[5dvw] sm:min-w-[5dvw] sm:w-[5dvw] justify-center">
					<ShopIcon
						className="sticky w-5 max-h-2 top-0 left-0"
						header={header}
					/>
				</div>
				<div className="w-[90dvw] max-w-[90dvw] pr-4 min-w-[90dvw]">
					<div className="top-0 left-0 sticky z-10 bg-white min-h-[12dvh]">
						{header && (
							<Header header={header} cart={cart} isLoggedIn={isLoggedIn} />
						)}
					</div>
					<main className="">{children}</main>
				</div>
			</div>
			{/* <div>
					<Suspense>
						<Await resolve={footer}>
							{(footer) => <Footer menu={footer?.menu} shop={header?.shop} />}
						</Await>
					</Suspense>
				</div> */}
		</>
	);
}

function CartAside({ cart }: { cart: LayoutProps["cart"] }) {
	return (
		<Aside id="cart-aside" heading="CART">
			<Suspense fallback={<p>Loading cart ...</p>}>
				<Await resolve={cart}>
					{(cart) => {
						return <CartMain cart={cart} layout="aside" />;
					}}
				</Await>
			</Suspense>
		</Aside>
	);
}

function SearchAside() {
	return (
		<Aside id="search-aside" heading="SEARCH">
			<div className="predictive-search">
				<br />
				<PredictiveSearchForm>
					{({ fetchResults, inputRef }) => (
						<div>
							<input
								name="q"
								onChange={fetchResults}
								onFocus={fetchResults}
								placeholder="Search"
								ref={inputRef}
								type="search"
							/>
							&nbsp;
							<button
								type="button"
								onClick={() => {
									window.location.href = inputRef?.current?.value
										? `/search?q=${inputRef.current.value}`
										: "/search";
								}}
							>
								Search
							</button>
						</div>
					)}
				</PredictiveSearchForm>
				<PredictiveSearchResults />
			</div>
		</Aside>
	);
}

const ShopIcon = ({
	header,
	className,
}: { header: HeaderQuery; className?: string }) => {
	return (
		<NavLink
			prefetch="intent"
			to="/"
			className={(props) => {
				return `sticky ${className} ${getHeaderNavLinkStyle(props)}`;
			}}
			end
		>
			{header.shop.brand?.logo?.image?.url ? (
				<AspectRatio ratio={1 / 1}>
					<img
						width={500}
						height={500}
						src={header.shop.brand.logo.image.url}
						alt={`Logo for ${header.shop.name}`}
					/>
				</AspectRatio>
			) : (
				<FaQuestion height={500} width={500} className="" />
			)}
		</NavLink>
	);
};

function MobileMenuAside({
	menu,
	shop,
}: {
	menu: HeaderQuery["menu"];
	shop: HeaderQuery["shop"];
}) {
	return (
		menu &&
		shop?.primaryDomain?.url && (
			<Aside id="mobile-menu-aside" heading="MENU">
				<HeaderMenu
					menu={menu}
					viewport="mobile"
					primaryDomainUrl={shop.primaryDomain.url}
				/>
			</Aside>
		)
	);
}
