import { Await } from "@remix-run/react";
import { Suspense } from "react";
import type { HeaderQuery } from "storefrontapi.generated";
import { CartMain } from "./Cart/Cart";
import type { LayoutProps } from "./Main/Layout";
import { PredictiveSearchForm, PredictiveSearchResults } from "./Search";

/**
 * A side bar component with Overlay that works without JavaScript.
 * @example
 * ```jsx
 * <Aside id="search-aside" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
	children,
	heading,
	id = "aside",
}: {
	children?: React.ReactNode;
	heading: React.ReactNode;
	id?: string;
}) {
	return (
		<div aria-modal className="overlay" id={id} role="dialog">
			<button
				type="button"
				className="close-outside"
				onClick={() => {
					history.go(-1);
					window.location.hash = "";
				}}
			/>
			<aside>
				<header>
					<h3>{heading}</h3>
					<CloseAside />
				</header>
				<main>{children}</main>
			</aside>
		</div>
	);
}

function CloseAside() {
	return (
		/* eslint-disable-next-line jsx-a11y/anchor-is-valid */
		<a className="close" href="#" onChange={() => history.go(-1)}>
			&times;
		</a>
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
