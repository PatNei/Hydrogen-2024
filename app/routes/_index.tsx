import { json, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { useLoaderData, Link, type MetaFunction } from "@remix-run/react";
import { Pagination, getPaginationVariables, Money } from "@shopify/hydrogen";
import type { HydrogenImageProps } from "@shopify/hydrogen-react/Image";
import type { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import placeholderImage from "./assets/placeholder.webp";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const IMAGE_PRODUCT_WIDTH = 200;
const IMAGE_PRODUCT_HEIGHT = 200;

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
	console.log(placeholderImage);
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

function ProductsGrid({ products }: { products: ProductItemFragment[] }) {
	return (
		<div className="w-screen p-2">
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
		<div className="mb-4 min-h-64 gap-10 flex max-w-screen flex-col">
			<h4>{product.title}</h4>

			<Carousel
				opts={{
					align: "start",
					loop: true,
					dragFree: true,
				}}
				className="flex p-6 gap-4 max-w-[100dvw] min-w-[100dvw]"
			>
				<div className="content-center">
					<CarouselPrevious disabled={product.images.nodes.length < 5} />
				</div>
				<div className="w-full">
					<CarouselContent>
						{product.images.nodes.length > 0 ? (
							product.images.nodes.map((_image) => {
								return (
									<CarouselProductItem
										key=""
										product={product}
										variantUrl={variantUrl}
										invisible={false}
										_image={{ data: _image }}
									/>
								);
							})
						) : (
							<CarouselProductItem
								product={product}
								variantUrl={variantUrl}
								invisible={false}
							/>
						)}
						{Array.from({ length: 5 - product.images.nodes.length - 1 }).map(
							(_, i) => {
								return (
									<CarouselProductItem
										key={`CPI-${i.toString()}`}
										product={product}
										variantUrl={variantUrl}
										invisible={true}
									/>
								);
							},
						)}
					</CarouselContent>
				</div>
				<div className="content-center">
					<CarouselNext disabled={product.images.nodes.length < 5} />
				</div>
			</Carousel>
			<div>
				<small>
					<Money data={product.priceRange.minVariantPrice} />
				</small>
			</div>
		</div>
	);
}

export const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }

  fragment ProductItem on Product {
	id
	handle
	title
	featuredImage {
		id
		altText
		url
		width
		height
		
	  }
	images (first: 15){
		nodes {
		  id
		  altText
		  url
		  width
		  height
		}
	}
	priceRange {
	  minVariantPrice {
		...MoneyProductItem
	  }
	  maxVariantPrice {
		...MoneyProductItem
	  }
	}
	variants(first: 1) {
	  nodes {
		selectedOptions {
		  name
		  value
		}
	  }
	}
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2024-01/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
` as const;

type CarouselProductItemProps = {
	product: ProductItemFragment;
	variantUrl: string;
	invisible: boolean;
	_image?: HydrogenImageProps;
};

const CarouselProductItem = ({
	product,
	variantUrl,
	invisible,
	_image,
}: CarouselProductItemProps) => {
	return (
		<CarouselItem
			className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
			key={`ci-${_image?.data?.id ?? "placeholder"}`}
		>
			<Link key={product.id} prefetch="intent" to={variantUrl}>
				<AspectRatio ratio={4 / 5}>
					<img
						className={`min-w-full min-h-full ${invisible ? "opacity-0" : ""}`}
						key={_image?.data?.id ?? "image-placeholder"}
						width={IMAGE_PRODUCT_WIDTH}
						height={IMAGE_PRODUCT_HEIGHT}
						alt={`${product.title}-${_image?.data?.altText ?? "placeholder"}`}
						src={invisible ? "" : _image?.data?.url ?? placeholderImage}
						aria-hidden={invisible}
					/>
				</AspectRatio>
			</Link>
		</CarouselItem>
	);
};
