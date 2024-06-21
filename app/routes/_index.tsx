import { json, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { useLoaderData, type MetaFunction } from "@remix-run/react";
import { Pagination, getPaginationVariables } from "@shopify/hydrogen";
import type { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import { CATALOG_QUERY } from "~/graphql/products/ProductQuery";
import { ProductCard } from "~/components/ProductCard";

const AMOUNT_OF_PRODUCTS = 8;

export const meta: MetaFunction<typeof loader> = () => {
	return [{ title: "Hydrogen | Products" }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	const { storefront } = context;
	const paginationVariables = getPaginationVariables(request, {
		pageBy: AMOUNT_OF_PRODUCTS,
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

function ProductsGrid({ products }: { products: ProductItemFragment[] }) {
	return (
		<div className="columns-1 break-inside-avoid-column clear-both sm:columns-2 lg:columns-3 odd:float-right even:float-left max-w-full">
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
	product: ProductItemFragment;
	loading?: "eager" | "lazy";
	className?: string;
}) {
	const variant = product.variants.nodes[0];
	const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
	return (
		<div className="flex overflow-hidden truncate mt-12 even:mt-14 break-inside-avoid first:my-0 flex-col gap-4">
			{product.images.nodes.length > 0 ? (
				product.images.nodes.map((_image, index) => {
					if (index >= 1) {
						return;
					}
					return (
						<ProductCard
							className="first:mt-0"
							key={`CPI-${_image.id}`}
							product={product}
							variantUrl={variantUrl}
							productImageProps={{ image: _image, productTitle: product.title }}
						/>
					);
				})
			) : (
				<ProductCard
					product={product}
					productImageProps={{ productTitle: product.title }}
					variantUrl={variantUrl}
				/>
			)}
			<div className="flex divide-x divide-black flex-row max-h-max h-fit min-h-min text-balance max-w-full w-full align-middle text-middle">
				<div className="max-w-2 h-full" />
				<blockquote className="h-full pl-3 leading-line w-full text-pretty">
					{product.title} adkjhsahjkdasjhkdhjkas dhjkashjkdashjkdahjkshdjks
				</blockquote>
			</div>
		</div>
	);
}
