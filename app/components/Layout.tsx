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
			<div className="flex flex-row min-w-screen max-w-screen my-6">
				<div className="flex content-center justify-center sm:justify-end min-w-[15vw] sm:min-w-[10vw] max-w-[10vw] w-[10vw] h-screen">
					<ShopIcon header={header} />
				</div>
				<div className="flex flex-col max-width-[90vw] min-width-[90vw] w-[90vw] pr-[5vw] gap-14">
					{header && (
						<Header header={header} cart={cart} isLoggedIn={isLoggedIn} />
					)}
					<main className="w-full">{children}</main>
				</div>
			</div>
			<Suspense>
				<Await resolve={footer}>
					{(footer) => <Footer menu={footer?.menu} shop={header?.shop} />}
				</Await>
			</Suspense>
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

const ShopIcon = ({ header }: { header: HeaderQuery }) => {
	return (
		<NavLink
			prefetch="intent"
			to="/"
			className={(props) => {
				return `max-h-[10%] max-w-full ${getHeaderNavLinkStyle(props)}`;
			}}
			end
		>
			{header.shop.brand?.logo?.image?.url ? (
				<AspectRatio className="" ratio={5 / 1}>
					<img
						src={header.shop.brand.logo.image.url}
						width={20}
						height={20}
						alt={`Logo for ${header.shop.name}`}
					/>
				</AspectRatio>
			) : (
				<FaQuestion height={500} width={500} className=" w-full h-full" />
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
