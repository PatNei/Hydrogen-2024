import { json, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { useLoaderData, Link, type MetaFunction } from "@remix-run/react";
import {
	Pagination,
	getPaginationVariables,
	Image,
	Money,
} from "@shopify/hydrogen";
import type { ProductFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import {
	CATALOG_QUERY,
	PRODUCT_ITEM_FRAGMENT,
} from "~/graphql/products/ProductQuery";

export const meta: MetaFunction<typeof loader> = () => {
	return [{ title: "Hydrogen | Products" }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	const { storefront } = context;
	const paginationVariables = getPaginationVariables(request, {
		pageBy: 8,
	});

	const { products } = await storefront.query(CATALOG_QUERY, {
		variables: { ...paginationVariables },
	});

	return json({ products });
}

export default function Collection() {
	const { products } = useLoaderData<typeof loader>();

	return (
		<div className="collection">
			<h1>Products</h1>
			<Pagination connection={products}>
				{({ nodes, isLoading, PreviousLink, NextLink }) => (
					<>
						<PreviousLink>
							{isLoading ? "Loading..." : <span>↑ Load previous</span>}
						</PreviousLink>
						<ProductsGrid products={nodes} />
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

function ProductsGrid({ products }: { products: ProductFragment[] }) {
	return (
		<div className="products-grid">
			{products.map((product, index) => {
				return (
					<ProductItem
						key={product.id}
						product={product}
						loading={index < 8 ? "eager" : undefined}
					/>
				);
			})}
		</div>
	);
}

function ProductItem({
	product,
	loading,
}: {
	product: ProductFragment;
	loading?: "eager" | "lazy";
}) {
	const variant = product.variants.nodes[0];
	const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
	return (
		<Link
			className="product-item"
			key={product.id}
			prefetch="intent"
			to={variantUrl}
		>
			{product.featuredImage && (
				<Image
					alt={product.featuredImage.altText || product.title}
					aspectRatio="1/1"
					data={product.featuredImage}
					loading={loading}
					sizes="(min-width: 45em) 400px, 100vw"
				/>
			)}
			<h4>{product.title}</h4>
			<small>
				<Money data={product.priceRange.minVariantPrice} />
			</small>
		</Link>
	);
}
