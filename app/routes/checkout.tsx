//  https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/checkout

import { useMatches, Await } from "@remix-run/react";
import { Suspense } from "react";
import { useRootLoaderData } from "~/lib/root-data";

export default function Checkout() {
	const data = useRootLoaderData();
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>

	return (
		<div>
			<Suspense fallback={<div>cart loading.. hol on..</div>}>
				<Await resolve={data?.cart}>
					{(_cart) => (
						<div>
							<div>{_cart?.checkoutUrl}</div>
							{_cart?.lines?.nodes?.map((line) => (
								<div key="">{line.id}</div>
							))}
						</div>
					)}
				</Await>
			</Suspense>
		</div>
	);
}
