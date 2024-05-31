import { json, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { useLoaderData, Link, type MetaFunction } from "@remix-run/react";
import {
	Pagination,
	getPaginationVariables,
	Image,
	Money,
} from "@shopify/hydrogen";
import type { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

export const meta: MetaFunction<typeof loader> = () => {
	return [{ title: "Hydrogen | Products" }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	const { storefront } = context;
	const paginationVariables = getPaginationVariables(request, {
		pageBy: 8,
	});
	console.log();
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

function ProductsGrid({ products }: { products: ProductItemFragment[] }) {
	return (
		<div>
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
		<div className="flex">
			<h4>{product.title}</h4>

			<Carousel
				className="w-full max-w-sm"
				opts={{
					align: "start",
				}}
			>
				{product.images.nodes.length > 0 && (
					<CarouselContent>
						{product.images.nodes.map((_image) => {
							return (
								<CarouselItem className="basis-1/3" key={`ci-${_image.id}`}>
									<Card>
										<Link key={product.id} prefetch="intent" to={variantUrl}>
											<Image
												key={_image.id}
												alt={_image.altText || product.title}
												data={_image}
												loading={loading}
												width={100}
												height={100}
											/>
										</Link>
									</Card>
								</CarouselItem>
							);
						})}
					</CarouselContent>
				)}
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
			<small>
				<Money data={product.priceRange.minVariantPrice} />
			</small>
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
