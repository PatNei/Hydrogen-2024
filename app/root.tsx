import { useNonce } from "@shopify/hydrogen";
import { defer, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	useRouteError,
	useLoaderData,
	ScrollRestoration,
	isRouteErrorResponse,
	type ShouldRevalidateFunction,
} from "@remix-run/react";
import favicon from "./assets/favicon.svg";
import tailwindStyles from "./tailwind.css";
import { Layout } from "~/components/Layout";
import { FOOTER_QUERY, HEADER_QUERY } from "./graphql/shop/ShopQuery";

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
	formMethod,
	currentUrl,
	nextUrl,
}) => {
	// revalidate when a mutation is performed e.g add to cart, login...
	if (formMethod && formMethod !== "GET") {
		return true;
	}

	// revalidate when manually revalidating via useRevalidator
	if (currentUrl.toString() === nextUrl.toString()) {
		return true;
	}

	return false;
};

export function links() {
	return [
		{ rel: "stylesheet", href: tailwindStyles },
		{
			rel: "preconnect",
			href: "https://cdn.shopify.com",
		},
		{
			rel: "preconnect",
			href: "https://shop.app", // TODO: What is this?
		},
		{ rel: "icon", type: "image/svg+xml", href: favicon },
	];
}

export async function loader({ context }: LoaderFunctionArgs) {
	const { storefront, customerAccount, cart } = context;
	const publicStoreDomain = context.env.PUBLIC_STORE_DOMAIN;

	const isLoggedInPromise = customerAccount.isLoggedIn();
	const cartPromise = cart.get();

	// defer the footer query (below the fold)
	const footerPromise = storefront.query(FOOTER_QUERY, {
		cache: storefront.CacheLong(),
		variables: {
			footerMenuHandle: "footer", // Adjust to your footer menu handle
		},
	});

	// await the header query (above the fold)
	const headerPromise = storefront.query(HEADER_QUERY, {
		cache: storefront.CacheLong(),
		variables: {
			headerMenuHandle: "main-menu", // Adjust to your header menu handle
		},
	});

	return defer(
		{
			cart: cartPromise,
			footer: footerPromise,
			header: await headerPromise,
			isLoggedIn: isLoggedInPromise,
			publicStoreDomain,
		},
		{
			headers: {
				"Set-Cookie": await context.session.commit(),
			},
		},
	);
}

export default function App() {
	const nonce = useNonce();
	const data = useLoaderData<typeof loader>();

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<Layout {...data}>
					<Outlet />
				</Layout>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	const rootData = useLoaderData<typeof loader>();
	const nonce = useNonce();
	let errorMessage = "Unknown error";
	let errorStatus = 500;

	if (isRouteErrorResponse(error)) {
		errorMessage = error?.data?.message ?? error.data;
		errorStatus = error.status;
	} else if (error instanceof Error) {
		errorMessage = error.message;
	}

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<Layout {...rootData}>
					<div className="route-error">
						<h1>Oops</h1>
						<h2>{errorStatus}</h2>
						{errorMessage && (
							<fieldset>
								<pre>{errorMessage}</pre>
							</fieldset>
						)}
					</div>
				</Layout>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	);
}
