import { ScrollArea } from "@/components/ui/scroll-area";
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
	useOptimisticVariant,
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
import { H1, H2 } from "~/components/Default/Heading";
import { P } from "~/components/Default/P";
import { RichText } from "~/components/Default/RichText";
import { SeperatedBlockQuote } from "~/components/Default/SeperatedBlockQuote";
import { CreateLineForm } from "~/components/Forms/CreateLineForm";
import { ImageGrid } from "~/components/Product/ImageGrid";
import { ProductsGrid } from "~/components/Product/ProductGrid";
import { ProductImage } from "~/components/Product/ProductImage";
import { NavLinkP } from "~/components/Remix/NavLink";
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
	const selectedVariant = useOptimisticVariant(
		product.selectedVariant,
		variants,
	);
	return (
		<div className="flex flex-col sm:flex-row gap-24 justify-end ">
			<ScrollArea className="h-[84dvh] w-full sm:w-4/6 min-w-[28dvw] sm:max-w-[28dvw] mx-auto">
				<ImageGrid>
					{product.images.nodes.map((_image) => {
						return (
							<ProductImage
								key={_image.id}
								image={_image}
								productTitle={product.title}
							/>
						);
					})}
				</ImageGrid>
			</ScrollArea>
			{/* </div> */}
			<ScrollArea className="h-[84dvh] pt-4 sm:w-2/6 bg-white">
				<div className="flex flex-col gap-10">
					<div className="flex flex-col gap-2">
						<H1>{product.title}</H1>
						<ProductPrice selectedVariant={selectedVariant} />

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
										variants={data?.product?.variants.nodes || []}
										waitForNavigation={false}
									>
										{({ option }) => <ProductOptions option={option} />}
									</VariantSelector>
								);
							}}
						</Await>
						<CreateLineForm
							optimisticCart={optimisticCart}
							selectedVariant={selectedVariant}
						/>
					</div>
					<div>
						{/* biome-ignore lint/security/noDangerouslySetInnerHtml: We might need to reconsider this but for now it is allowed. Purifying the input could be the way */}
						<P dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
					</div>
				</div>
			</ScrollArea>
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
				<H2>
					SALE!!!!!!!!!!
					<Money
						className="line-through opacity-30"
						data={selectedVariant.compareAtPrice}
					/>
				</H2>
			)}
			<H2>
				<Money className="h-5" data={selectedVariant.price} />
			</H2>
		</div>
	);
}

function ProductOptions({ option }: { option: VariantOption }) {
	return (
		<fieldset className="w-full">
			<legend>
				<H2>{option.name}</H2>
			</legend>
			<div className="flex w-full flex-wrap">
				{option.values.map(({ value, isAvailable, isActive, to }) => {
					return (
						<Link
							className={`h-12 min-w-18 w-24 border-[1px] p-1 inline-block ${isActive ? "bg-slate-500" : ""}`}
							key={option.name + value}
							prefetch="intent"
							preventScrollReset
							replace
							to={to}
						>
							<P
								className={"font-bold"}
								disableLowerCase={true}
								isActive={isActive}
							>
								{value.toUpperCase()}
							</P>
						</Link>
					);
				})}
			</div>
		</fieldset>
	);
}
