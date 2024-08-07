import { Link, type MetaFunction, useLoaderData } from "@remix-run/react";
import {
	Image,
	Money,
	Pagination,
	getPaginationVariables,
} from "@shopify/hydrogen";
import { type LoaderFunctionArgs, json, redirect } from "@shopify/remix-oxygen";
import type { ProductItemFragment } from "storefrontapi.generated";
import { ProductsGrid } from "~/components/Product/ProductGrid";
import { ProductItem } from "~/components/Product/ProductItem";
import { COLLECTION_QUERY } from "~/graphql/products/CollectionsQuery";
import { useVariantUrl } from "~/lib/variants";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [{ title: `Hydrogen | ${data?.collection.title ?? ""} Collection` }];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	const { handle } = params;
	const { storefront } = context;
	const paginationVariables = getPaginationVariables(request, {
		pageBy: 8,
	});

	if (!handle) {
		return redirect("/collections");
	}

	const { collection } = await storefront.query(COLLECTION_QUERY, {
		variables: { handle, ...paginationVariables },
	});

	if (!collection) {
		throw new Response(`Collection ${handle} not found`, {
			status: 404,
		});
	}
	return json({ collection });
}

export default function Collection() {
	const { collection } = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col">
			<h1>{collection.title}</h1>
			<p className="collection-description">{collection.description}</p>
			<Pagination connection={collection.products}>
				{({ nodes, isLoading, PreviousLink, NextLink }) => (
					<>
						<PreviousLink>
							{isLoading ? "Loading..." : <span>↑ Load previous</span>}
						</PreviousLink>
						<ProductsGrid itemAmount={nodes.length}>
							{nodes.map((product, index) => {
								return (
									<ProductItem
										key={product.id}
										product={product}
										loading={index < 8 ? "eager" : undefined}
									/>
								);
							})}
						</ProductsGrid>
						<br />
						<NextLink>
							{isLoading ? "Loading..." : <span>Load more ↓</span>}
						</NextLink>
					</>
				)}
			</Pagination>
		</div>
	);
}

// function ProductItem({
// 	product,
// 	loading,
// }: {
// 	product: ProductItemFragment;
// 	loading?: "eager" | "lazy";
// }) {
// 	const variant = product.variants.nodes[0];
// 	const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
// 	return (
// 		<Link
// 			className="product-item"
// 			key={product.id}
// 			prefetch="intent"
// 			to={variantUrl}
// 		>
// 			{product.featuredImage && (
// 				<Image
// 					alt={product.featuredImage.altText || product.title}
// 					aspectRatio="1/1"
// 					data={product.featuredImage}
// 					loading={loading}
// 					sizes="(min-width: 45em) 400px, 100vw"
// 				/>
// 			)}
// 			<h4>{product.title}</h4>
// 			<small>
// 				<Money data={product.priceRange.minVariantPrice} />
// 			</small>
// 		</Link>
// 	);
// }
