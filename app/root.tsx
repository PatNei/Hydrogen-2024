import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	type ShouldRevalidateFunction,
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
	useRouteLoaderData,
} from "@remix-run/react";
import { useNonce } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, defer } from "@shopify/remix-oxygen";
import favicon from "./assets/favicon.svg";
import { FOOTER_QUERY, HEADER_QUERY } from "./graphql/shop/ShopQuery";
import tailwindStyles from "./tailwind.css?url";
import { PageLayout } from "./components/Main/PageLayout";
import { P } from "./components/Default/P";
import type React from "react";

export type RootLoader = typeof loader;

export async function loader(args: LoaderFunctionArgs) {

	// Start fetching non-critical data without blocking time to first byte
	const deferredData = loadDeferredData(args);
	// ^ are placed this way so we optimise how we load things.

	// Await the critical data required to render initial state of the page
	const criticalData = await loadCriticalData(args);
	// ^ are placed this way so we optimise how we load things.

	const { storefront, cart, env } = args.context;
	const publicStoreDomain = env.PUBLIC_STORE_DOMAIN;


	return defer({
		...deferredData,
		...criticalData,
		publicStoreDomain,
		// shop: getShopAnalytics({
		// 	storefront,
		// 	publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
		//   }),
		//   consent: {
		// 	checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
		// 	storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
		// 	withPrivacyBanner: true,
		// 	// localize the privacy banner
		// 	country: args.context.storefront.i18n.country,
		// 	language: args.context.storefront.i18n.language,
		//   },
	});
}



function Layout({ children }: { children?: React.ReactNode }) {
	const nonce = useNonce();
	const data = useRouteLoaderData<typeof loader>('root');
	if (!data) return <div>No data</div>
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="h-screen">
				{data ? <PageLayout>{children}</PageLayout> : (children)}

				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	);
}

export default function App() {
	return <Layout>
		<Outlet />

	</Layout>
}

export function ErrorBoundary(_Error: { _error: Error }) {
	const error = useRouteError();
	let errorMessage = "Unknown error";
	let errorStatus = 500;
	console.log(error)

	if (isRouteErrorResponse(error)) {
		errorMessage = error?.data?.message ?? error.data;
		errorStatus = error.status;
	} else if (error instanceof Error) {
		errorMessage = error.message;
	}

	return (
		<div className="mx-auto w-[50dvw] text-center text-wrap">
			<div className="flex flex-col">
				<h1>This was supposed to happen..</h1>
				<h2 className="">{errorStatus}</h2>
				{errorMessage && (
					<div className="w-full">
						<P>{errorMessage}</P>
					</div>
				)}
				<h1>however.... just to be safe you should probably reload.</h1>
			</div>
		</div>
	);
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({ context }: LoaderFunctionArgs) {
	const { storefront, customerAccount, cart } = context;

	// defer the footer query (below the fold)
	const footer = storefront
		.query(FOOTER_QUERY, {
			cache: storefront.CacheLong(),
			variables: {
				footerMenuHandle: 'footer', // Adjust to your footer menu handle
			},
		})
		.catch((error) => {
			// Log query errors, but don't throw them so the page can still render
			console.error(error);
			return null;
		});
	return {
		cart: cart.get(),
		isLoggedIn: customerAccount.isLoggedIn(),
		footer,
	};
}


/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({ context }: LoaderFunctionArgs) {
	const { storefront } = context;

	const [header] = await Promise.all([
		storefront.query(HEADER_QUERY, {
			cache: storefront.CacheLong(),
			variables: {
				headerMenuHandle: 'main-menu', // Adjust to your header menu handle
			},
		}),
		// Add other queries here, so that they are loaded in parallel
	]);

	return { header };
}


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
