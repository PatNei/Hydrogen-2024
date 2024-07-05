import { Suspense } from "react";
import {
	defer,
	redirect,
	type LoaderFunctionArgs,
} from "@shopify/remix-oxygen";
import {
	Await,
	Link,
	useLoaderData,
	type MetaFunction,
	type FetcherWithComponents,
} from "@remix-run/react";
import type {
	ProductFragment,
	ProductVariantsQuery,
	ProductVariantFragment,
} from "storefrontapi.generated";
import {
	Image,
	Money,
	VariantSelector,
	type VariantOption,
	getSelectedProductOptions,
	CartForm,
	useOptimisticCart,
	useOptimisticData,
	OptimisticInput,
} from "@shopify/hydrogen";
import type {
	CartLineInput,
	SelectedOption,
} from "@shopify/hydrogen/storefront-api-types";
import { getVariantUrl } from "~/lib/variants";
import { PRODUCT_QUERY, VARIANTS_QUERY } from "~/graphql/products/ProductQuery";
import { ProductImage } from "~/components/ProductImage";
import { SeperatedBlockQuote } from "~/components/SeperatedBlockQuote";
import { getNumFromShopifyId } from "~/lib/shopify-util";
import { optimisticQuantityID } from "~/lib/CONST";

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
	return defer({ product, variants, cart });
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
	const { product, variants, cart } = useLoaderData<typeof loader>();
	const optimisticCart = useOptimisticCart(cart);
	const { selectedVariant } = product;
	const amount = 2;
	if (!selectedVariant) return <div>OOOOH boy did it go wrong?</div>; // TODO: This is a terrible way to do it fix in the future
	return (
		<div className="mt-4">
			<SeperatedBlockQuote>
				<p>{product.title}</p>
				<ProductPrice selectedVariant={selectedVariant} />
			</SeperatedBlockQuote>
			<div className="flex flex-col max-w-full w-full relative">
				{product.images.nodes.map((_image, index) => {
					return (
						<ProductImage
							key={""}
							image={_image}
							productTitle={product.title}
						/>
					);
				})}
			</div>
			<div className="sticky bottom-0 left-0 bg-white">
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
				<CartForm
					route="/cart"
					action={CartForm.ACTIONS.LinesAdd}
					inputs={{
						lines: [
							{
								merchandiseId: selectedVariant.id,
								quantity: amount,
								selectedVariant: selectedVariant,

								// The whole selected variant is not needed on the server, used in
								// the client to render the product until the server action resolves
							},
						],
					}}
				>
					<OptimisticInput
						id={getNumFromShopifyId(selectedVariant.id)}
						data={{
							action: "add",
							item: selectedVariant,
							quantity: amount,
						}}
					/>
					<OptimisticInput
						id={optimisticQuantityID}
						data={{ quantity: amount } as optimisticQuantity}
					/>
					<button disabled={optimisticCart.isOptimistic} type="submit">
						{optimisticCart.isOptimistic ? "Added!" : "Add to cart"}
					</button>
				</CartForm>
			</div>
		</div>
	);
}

function ProductMain({
	selectedVariant,
	product,
	variants,
	className = "",
}: {
	product: ProductFragment;
	selectedVariant: ProductFragment["selectedVariant"];
	variants: Promise<ProductVariantsQuery>;
	className?: string;
}) {
	const { title, descriptionHtml } = product;
	return (
		<div className={`${className}`}>
			<SeperatedBlockQuote>
				<p>{title}</p>
				<ProductPrice selectedVariant={selectedVariant} />
				<Suspense
					fallback={
						<ProductForm
							product={product}
							selectedVariant={selectedVariant}
							variants={[]}
						/>
					}
				>
					<Await
						errorElement="There was a problem loading product variants"
						resolve={variants}
					>
						{(data) => (
							<ProductForm
								product={product}
								selectedVariant={selectedVariant}
								variants={data.product?.variants.nodes || []}
							/>
						)}
					</Await>
				</Suspense>
			</SeperatedBlockQuote>
			<p>
				<strong>Description</strong>
			</p>
		</div>
	);
}

function ProductPrice({
	selectedVariant,
}: {
	selectedVariant: ProductFragment["selectedVariant"];
}) {
	return (
		<div className="product-price">
			{selectedVariant?.compareAtPrice ? (
				<>
					<p>SALE!!!!!!!!!!</p>
					<div className="product-price-on-sale">
						{selectedVariant ? <Money data={selectedVariant.price} /> : null}
						<Money data={selectedVariant.compareAtPrice} />
					</div>
				</>
			) : (
				selectedVariant?.price && <Money data={selectedVariant?.price} />
			)}
		</div>
	);
}

function ProductForm({
	product,
	selectedVariant,
	variants,
}: {
	product: ProductFragment;
	selectedVariant: ProductFragment["selectedVariant"];
	variants: Array<ProductVariantFragment>;
}) {
	return (
		<div className="product-form">
			<VariantSelector
				handle={product.handle}
				options={product.options}
				variants={variants}
			>
				{({ option }) => <ProductOptions key={option.name} option={option} />}
			</VariantSelector>
			<AddToCartButton
				disabled={!selectedVariant || !selectedVariant.availableForSale}
				onClick={() => {}}
				lines={
					selectedVariant
						? [
								{
									merchandiseId: selectedVariant.id,
									quantity: 1,
								},
							]
						: []
				}
			>
				{selectedVariant?.availableForSale ? "Add to cart" : "Sold out"}
			</AddToCartButton>
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

function AddToCartButton({
	analytics,
	children,
	disabled,
	lines,
	onClick,
}: {
	analytics?: unknown;
	children: React.ReactNode;
	disabled?: boolean;
	lines: CartLineInput[];
	onClick?: () => void;
}) {
	return (
		<CartForm
			route="/cart"
			inputs={{ lines }}
			action={CartForm.ACTIONS.LinesAdd}
		>
			{(fetcher: FetcherWithComponents<any>) => (
				<>
					<input
						name="analytics"
						type="hidden"
						value={JSON.stringify(analytics)}
					/>
					<button
						type="submit"
						onClick={onClick}
						disabled={disabled ?? fetcher.state !== "idle"}
					>
						{children}
					</button>
				</>
			)}
		</CartForm>
	);
}
