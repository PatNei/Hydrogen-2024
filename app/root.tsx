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
} from "@remix-run/react";
import { useNonce } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, defer } from "@shopify/remix-oxygen";
import favicon from "./assets/favicon.svg";
import { FOOTER_QUERY, HEADER_QUERY } from "./graphql/shop/ShopQuery";
import tailwindStyles from "./tailwind.css?url";
import { PageLayout } from "./components/Main/PageLayout";
import { P } from "./components/Default/P";
import type React from "react";

export async function loader({ context }: LoaderFunctionArgs) {
	const { storefront, cart } = context;
	const publicStoreDomain = context.env.PUBLIC_STORE_DOMAIN;

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

	return defer({
		cart: cart.get(),
		footer: footerPromise,
		header: await headerPromise,
		publicStoreDomain,
	});
}

export default function App() {
	return <Outlet />;
}

export function Layout({ children }: { children?: React.ReactNode }) {
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
			<body className="h-screen">
				{data ? <PageLayout {...data}>{children}</PageLayout> : children}
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	let errorMessage = "Unknown error";
	let errorStatus = 500;

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
