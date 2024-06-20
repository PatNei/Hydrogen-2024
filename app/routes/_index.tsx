import { json, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { useLoaderData, Link, type MetaFunction } from "@remix-run/react";
import { Pagination, getPaginationVariables, Money } from "@shopify/hydrogen";
import type { HydrogenImageProps } from "@shopify/hydrogen-react/Image";
import type { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import placeholderImage from "./assets/placeholder.webp";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CATALOG_QUERY } from "~/graphql/ProductQuery";
import { Separator } from "@/components/ui/separator";

const IMAGE_PRODUCT_WIDTH = 1920;
const IMAGE_PRODUCT_HEIGHT = 1080;
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
						// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
						<>
							<ProductCard
								className="first:mt-0"
								key={`CPI-${_image.id}`}
								product={product}
								variantUrl={variantUrl}
								invisible={false}
								_image={{ data: _image }}
							/>
						</>
					);
				})
			) : (
				<ProductCard
					product={product}
					variantUrl={variantUrl}
					invisible={false}
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

type CarouselProductItemProps = {
	product: ProductItemFragment;
	variantUrl: string;
	invisible: boolean;
	_image?: HydrogenImageProps;
	className?: string;
};

const ProductCard = ({
	product,
	variantUrl,
	invisible,
	_image,
	className = "",
}: CarouselProductItemProps) => {
	return (
		<div className="min-h-full h-full w-full text-nowrap">
			<div
				className={`min-w-full max-w-full min-h-full h-full w-full relative ${className}`}
			>
				<Link
					key={product.id}
					className="min-w-full max-w-full w-full min-h-full max-h-full h-full peer"
					prefetch="intent"
					to={variantUrl}
					hidden={invisible}
				>
					<AspectRatio
						ratio={4 / 5}
						className="bg-black absolute top-0 left-0 min-w-full max-w-full w-full min-h-full max-h-full h-full"
					>
						<img
							className="min-w-full max-w-full w-full min-h-full max-h-full h-full absolute top-0 left-0"
							hidden={invisible}
							key={_image?.data?.id ?? "image-placeholder"}
							width={IMAGE_PRODUCT_WIDTH}
							height={IMAGE_PRODUCT_HEIGHT}
							alt={`${product.title}-${_image?.data?.altText ?? "placeholder"}`}
							src={invisible ? "" : _image?.data?.url ?? placeholderImage}
							aria-hidden={invisible}
						/>
					</AspectRatio>
				</Link>
				<div
					className="hidden peer-hover:flex
			transition ease-in-out delay-300 duration-150 flex-col gap-0 opacity-90 bg-slate-600 h-min max-h-min absolute bottom-0 left-0 text-center w-full min-w-full max-w-full text-white"
				>
					<h1 className="h-full max-h-full">{product.title}</h1>
					<Money
						className="h-full max-h-full"
						data={product.priceRange.minVariantPrice}
					/>
				</div>
			</div>
		</div>
	);
};
