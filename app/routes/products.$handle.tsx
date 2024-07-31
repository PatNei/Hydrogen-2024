import {
	Await,
	type FetcherWithComponents,
	Link,
	type MetaFunction,
	useLoaderData,
} from "@remix-run/react";
import {
	CartForm,
	Image,
	Money,
	OptimisticInput,
	type VariantOption,
	VariantSelector,
	getSelectedProductOptions,
	useOptimisticCart,
	useOptimisticData,
} from "@shopify/hydrogen";
import type {
	CartLineInput,
	SelectedOption,
} from "@shopify/hydrogen/storefront-api-types";
import {
	type LoaderFunctionArgs,
	defer,
	redirect,
} from "@shopify/remix-oxygen";
import { Suspense, forwardRef } from "react";
import type {
	ProductFragment,
	ProductVariantFragment,
	ProductVariantsQuery,
} from "storefrontapi.generated";
import { Button } from "~/components/Default/Button";
import { RichText } from "~/components/Default/RichText";
import { SeperatedBlockQuote } from "~/components/Default/SeperatedBlockQuote";
import { CreateLineForm } from "~/components/Forms/CreateLineForm";
import { ProductsGrid } from "~/components/Product/ProductGrid";
import { ProductImage } from "~/components/Product/ProductImage";
import { PRODUCT_QUERY } from "~/graphql/products/ProductQuery";
import { VARIANTS_QUERY } from "~/graphql/products/ProductVariantQuery";
import { useRootLoaderData } from "~/lib/root-data";
import { getVariantUrl } from "~/lib/variants";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [{ title: `Hydrogen | ${data?.product.title ?? ""}` }];
};

export type optimisticData = {
	action: string;
	item: unknown;
	quantity?: number;
};

export type optimisticQuantity = {
	quantity: number;
};

export async function loader({ params, request, context }: LoaderFunctionArgs) {
	const { handle } = params;
	const { storefront, session, cart } = context;

	if (!handle) {
		throw new Error("Expected product handle to be defined");
	}

	// await the query for the critical product data
	const { product } = await storefront.query(PRODUCT_QUERY, {
		variables: { handle, selectedOptions: getSelectedProductOptions(request) },
	});

	if (!product?.id) {
		throw new Response(null, { status: 404 });
	}

	const firstVariant = product.variants.nodes[0];
	const firstVariantIsDefault = Boolean(
		firstVariant.selectedOptions.find(
			(option: SelectedOption) =>
				option.name === "Title" && option.value === "Default Title",
		),
	);

	if (firstVariantIsDefault) {
		product.selectedVariant = firstVariant;
	} else {
		// if no selected variant was returned from the selected options,
		// we redirect to the first variant's url with it's selected options applied
		if (!product.selectedVariant) {
			throw redirectToFirstVariant({ product, request });
		}
	}

	// In order to show which variants are available in the UI, we need to query
	// all of them. But there might be a *lot*, so instead separate the variants
	// into it's own separate query that is deferred. So there's a brief moment
	// where variant options might show as available when they're not, but after
	// this deffered query resolves, the UI will update.
	const variants = storefront.query(VARIANTS_QUERY, {
		variables: { handle },
	});
	return defer({ product, variants });
}

function redirectToFirstVariant({
	product,
	request,
}: {
	product: ProductFragment;
	request: Request;
}) {
	const url = new URL(request.url);
	const firstVariant = product.variants.nodes[0];

	return redirect(
		getVariantUrl({
			pathname: url.pathname,
			handle: product.handle,
			selectedOptions: firstVariant.selectedOptions,
			searchParams: new URLSearchParams(url.search),
		}),
		{
			status: 302,
		},
	);
}

export default function Product() {
	// TODO: Consider https://github.com/cure53/DOMPurify for product descriptions

	const { product, variants } = useLoaderData<typeof loader>();
	const { cart } = useRootLoaderData();
	const optimisticCart = useOptimisticCart(cart);
	const { selectedVariant } = product;
	return (
		<div className="flex flex-col">
			<ProductsGrid itemAmount={product.images.nodes.length}>
				{product.images.nodes.map((_image) => {
					return (
						<ProductImage
							key={_image.id}
							image={_image}
							productTitle={product.title}
						/>
					);
				})}
			</ProductsGrid>
			{/* </div> */}
			<div className="sticky bottom-0 left-0 pt-4 bg-white">
				<SeperatedBlockQuote>
					<p>{product.title}</p>
					{/* biome-ignore lint/security/noDangerouslySetInnerHtml: We might need to reconsider this but for now it is allowed. Purifying the input could be the way */}
					<div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
					<ProductPrice selectedVariant={selectedVariant} />
				</SeperatedBlockQuote>
				{/* <div className="flex flex-col max-w-[40dvw] columns-2  w-full relative min-h-[70dvh]"> */}
				<Await
					errorElement="There was a problem loading product variants"
					resolve={variants}
				>
					{(data) => {
						return (
							<VariantSelector
								handle={product.handle}
								options={product.options}
								variants={data.product?.variants.nodes || []}
							>
								{({ option }) => (
									<ProductOptions key={option.name} option={option} />
								)}
							</VariantSelector>
						);
					}}
				</Await>
				<CreateLineForm
					optimisticCart={optimisticCart}
					selectedVariant={selectedVariant}
				/>
			</div>
		</div>
	);
}

function ProductPrice({
	selectedVariant,
}: {
	selectedVariant: ProductFragment["selectedVariant"];
}) {
	if (!selectedVariant) return <div>?</div>;

	return (
		<div className="flex flex-col">
			{selectedVariant.compareAtPrice && (
				<div>
					<p>SALE!!!!!!!!!!</p>
					<Money
						className="line-through opacity-30"
						data={selectedVariant.compareAtPrice}
					/>
				</div>
			)}
			<Money className="h-5" data={selectedVariant.price} />
		</div>
	);
}

function ProductOptions({ option }: { option: VariantOption }) {
	return (
		<div className="product-options" key={option.name}>
			<h5>{option.name}</h5>
			<div className="product-options-grid">
				{option.values.map(({ value, isAvailable, isActive, to }) => {
					return (
						<Link
							className="product-options-item"
							key={option.name + value}
							prefetch="intent"
							preventScrollReset
							replace
							to={to}
							style={{
								border: isActive ? "1px solid black" : "1px solid transparent",
								opacity: isAvailable ? 1 : 0.3,
							}}
						>
							{value}
						</Link>
					);
				})}
			</div>
			<br />
		</div>
	);
}
