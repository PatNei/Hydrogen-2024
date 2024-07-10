import { type MetaFunction, useLoaderData } from "@remix-run/react";
import { Pagination, getPaginationVariables } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";
import { ProductsGrid } from "~/components/Product/ProductGrid";
import { CATALOG_QUERY } from "~/graphql/products/ProductQuery";

const PAGE_BY_AMOUNT_OF_PRODUCTS = 8;

export const meta: MetaFunction<typeof loader> = () => {
	return [{ title: "Hydrogen | Products" }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	const { storefront } = context;
	const paginationVariables = getPaginationVariables(request, {
		pageBy: PAGE_BY_AMOUNT_OF_PRODUCTS,
	});
	const { products } = await storefront.query(CATALOG_QUERY, {
		variables: { ...paginationVariables },
	});
	return json({ products });
}

export default function Collection() {
	const { products } = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col max-w-full gap-4 mt-2">
			<Pagination connection={products}>
				{({ nodes, isLoading, PreviousLink, NextLink }) => (
					<>
						<PreviousLink>
							{isLoading ? "Loading..." : <span>↑ Load previous</span>}
						</PreviousLink>
						<ProductsGrid products={nodes} />
						<NextLink>
							{isLoading ? "Loading..." : <span>Load more ↓</span>}
						</NextLink>
					</>
				)}
			</Pagination>
		</div>
	);
}
