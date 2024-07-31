import { type MetaFunction, useLoaderData } from "@remix-run/react";
import { Pagination, getPaginationVariables } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";
import { ProductCollectionPagination } from "~/components/Product/ProductCollection";
import { ProductsGrid } from "~/components/Product/ProductGrid";
import { ProductItem } from "~/components/Product/ProductItem";
import { CATALOG_QUERY } from "~/graphql/products/CatalogQuery";

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
		<ProductCollectionPagination>
			<Pagination connection={products}>
				{({ nodes, isLoading, PreviousLink, NextLink }) => {
					return (
						<>
							<PreviousLink>
								{isLoading ? "Loading..." : <span>↑ Load previous</span>}
							</PreviousLink>
							<ProductsGrid itemAmount={nodes.length}>
								{products.nodes.map((product, index) => {
									return (
										<ProductItem
											key={product.id}
											product={product}
											loading={index < 8 ? "eager" : undefined}
											isLoading={isLoading}

										/>
									);
								})}
							</ProductsGrid>
							<NextLink>
								{isLoading ? "Loading..." : <span>Load more ↓</span>}
							</NextLink>
						</>
					);
				}}
			</Pagination>
		</ProductCollectionPagination>
	);
}
