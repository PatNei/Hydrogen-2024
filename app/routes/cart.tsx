import type { MetaFunction } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { CartForm, Image, Money } from "@shopify/hydrogen";
import type { CartQueryDataReturn } from "@shopify/hydrogen";
import type { CartLineUpdateInput } from "@shopify/hydrogen/storefront-api-types";
import { type ActionFunctionArgs, json } from "@shopify/remix-oxygen";
import type { CartApiQueryFragment } from "storefrontapi.generated";
import type { CartLine } from "~/components/Cart/CartPopover";
import { useRootLoaderData } from "~/lib/root-data";
import { useVariantUrl } from "~/lib/variants";
export const meta: MetaFunction = () => {
	return [{ title: "Hydrogen | Cart" }];
};

export async function action({ request, context }: ActionFunctionArgs) {
	const { cart } = context;
	const formData = await request.formData();
	const { action, inputs } = CartForm.getFormInput(formData);
	if (!action) {
		throw new Error("No action provided");
	}
	let status = 200;
	let result: CartQueryDataReturn;
	const _cart = await cart.get();
	switch (action) {
		case CartForm.ACTIONS.LinesAdd:
			result = await cart.addLines(inputs.lines);
			break;
		case CartForm.ACTIONS.LinesUpdate:
			result = await cart.updateLines(inputs.lines);
			break;
		case CartForm.ACTIONS.LinesRemove:
			result = await cart.removeLines(inputs.lineIds);
			console.log("Hi");
			break;
		case CartForm.ACTIONS.DiscountCodesUpdate: {
			const formDiscountCode = inputs.discountCode;

			// User inputted discount code
			const discountCodes = (
				formDiscountCode ? [formDiscountCode] : []
			) as string[];

			// Combine discount codes already applied on cart
			discountCodes.push(...inputs.discountCodes);

			result = await cart.updateDiscountCodes(discountCodes);
			break;
		}
		case CartForm.ACTIONS.BuyerIdentityUpdate: {
			result = await cart.updateBuyerIdentity({
				...inputs.buyerIdentity,
			});
			break;
		}
		default:
			throw new Error(`${action} cart action is not defined`);
	}

	const cartId = cart.getCartId();
	if (!cartId) throw new Error("CartId is undefined"); // TODO: Should be a better error
	const headers = cart.setCartId(cartId);
	const { cart: cartResult, errors } = result;
	const redirectTo = formData.get("redirectTo") ?? null;
	if (typeof redirectTo === "string") {
		status = 303;
		headers.set("Location", redirectTo);
	}

	headers.append("Set-Cookie", await context.session.commit());

	return json(
		{
			cart: cartResult,
			errors,
			analytics: {
				cartId,
			},
		},
		{ status, headers },
	);
}

export default function Cart() {
	const data = useRootLoaderData();
	return (
		<div className="cart">
			<h1>Cart</h1>
			<CartMain layout="page" cart={data.cart} />
		</div>
	);
}

// https://github.com/Shopify/hydrogen/blob/main/packages/hydrogen/CHANGELOG.md
// https://shopify.dev/docs/storefronts/headless/hydrogen/cart/setup

type CartMainProps = {
	cart: Promise<CartApiQueryFragment | null>;
	layout: "page" | "aside";
};

export function CartMain({ layout, cart }: CartMainProps) {
	// const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
	// const withDiscount =
	// 	cart &&
	// 	Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
	// const className = `cart-main ${withDiscount ? "with-discount" : ""}`;
	return (
		<div>
			Hello
			{/* <CartEmpty hidden={linesCount} layout={layout} />
			<CartDetails cart={cart} layout={layout} /> */}
		</div>
	);
}

// function CartDetails({ layout, cart }: CartMainProps) {
// 	const cartHasItems = !!cart && cart.totalQuantity > 0;

// 	return (
// 		<div className="cart-details">
// 			<CartLines lines={cart?.lines} layout={layout} />
// 			{cartHasItems && (
// 				<CartSummary cost={cart.cost} layout={layout}>
// 					<CartDiscounts discountCodes={cart.discountCodes} />
// 					<CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
// 				</CartSummary>
// 			)}
// 		</div>
// 	);
// }

// function CartLines({
// 	lines,
// 	layout,
// }: {
// 	layout: CartMainProps["layout"];
// 	lines: CartApiQueryFragment["lines"] | undefined;
// }) {
// 	if (!lines) return null;

// 	return (
// 		<div aria-labelledby="cart-lines">
// 			<ul>
// 				{lines.nodes.map((line) => (
// 					<CartLineItem key={line.id} line={line} layout={layout} />
// 				))}
// 			</ul>
// 		</div>
// 	);
// }

function CartLineItem({
	layout,
	line,
}: {
	layout: CartMainProps["layout"];
	line: CartLine;
}) {
	const { id, merchandise } = line;
	const { product, title, image, selectedOptions } = merchandise;
	const lineItemUrl = useVariantUrl(product.handle, selectedOptions);

	return (
		<li key={id} className="cart-line">
			{image && (
				<Image
					alt={title}
					aspectRatio="1/1"
					data={image}
					height={100}
					loading="lazy"
					width={100}
				/>
			)}

			<div>
				<Link
					prefetch="intent"
					to={lineItemUrl}
					onClick={() => {
						if (layout === "aside") {
							// close the drawer
							window.location.href = lineItemUrl;
						}
					}}
				>
					<p>
						<strong>{product.title}</strong>
					</p>
				</Link>
				<CartLinePrice line={line} as="span" />
				<ul>
					{selectedOptions.map((option) => (
						<li key={option.name}>
							<small>
								{option.name}: {option.value}
							</small>
						</li>
					))}
				</ul>
				<CartLineQuantity line={line} />
			</div>
		</li>
	);
}

function CartCheckoutActions({ checkoutUrl }: { checkoutUrl: string }) {
	if (!checkoutUrl) return null;

	return (
		<div>
			<a href={checkoutUrl} target="_self">
				<p>Continue to Checkout &rarr;</p>
			</a>
			<br />
		</div>
	);
}

export function CartSummary({
	cost,
	layout,
	children = null,
}: {
	children?: React.ReactNode;
	cost: CartApiQueryFragment["cost"];
	layout: CartMainProps["layout"];
}) {
	const className =
		layout === "page" ? "cart-summary-page" : "cart-summary-aside";

	return (
		<div aria-labelledby="cart-summary" className={className}>
			<h4>Totals</h4>
			<dl className="cart-subtotal">
				<dt>Subtotal</dt>
				<dd>
					{cost?.subtotalAmount?.amount ? (
						<Money data={cost?.subtotalAmount} />
					) : (
						"-"
					)}
				</dd>
			</dl>
			{children}
		</div>
	);
}

function CartLineRemoveButton({ lineIds }: { lineIds: string[] }) {
	return (
		<CartForm
			route="/cart"
			action={CartForm.ACTIONS.LinesRemove}
			inputs={{ lineIds }}
		>
			<button type="submit">Remove</button>
		</CartForm>
	);
}

function CartLineQuantity({ line }: { line: CartLine }) {
	if (!line || typeof line?.quantity === "undefined") return null;
	const { id: lineId, quantity } = line;
	const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
	const nextQuantity = Number((quantity + 1).toFixed(0));

	return (
		<div className="cart-line-quantity">
			<small>Quantity: {quantity} &nbsp;&nbsp;</small>
			<CartLineUpdateButton lines={[{ id: lineId, quantity: prevQuantity }]}>
				<button
					type="button"
					aria-label="Decrease quantity"
					disabled={quantity <= 1}
					name="decrease-quantity"
					value={prevQuantity}
				>
					<span>&#8722; </span>
				</button>
			</CartLineUpdateButton>
			&nbsp;
			<CartLineUpdateButton lines={[{ id: lineId, quantity: nextQuantity }]}>
				<button
					type="button"
					aria-label="Increase quantity"
					name="increase-quantity"
					value={nextQuantity}
				>
					<span>&#43;</span>
				</button>
			</CartLineUpdateButton>
			&nbsp;
			<CartLineRemoveButton lineIds={[lineId]} />
		</div>
	);
}

function CartLinePrice({
	line,
	priceType = "regular",
	...passthroughProps
}: {
	line: CartLine;
	priceType?: "regular" | "compareAt";
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	[key: string]: any;
}) {
	if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

	const moneyV2 =
		priceType === "regular"
			? line.cost.totalAmount
			: line.cost.compareAtAmountPerQuantity;

	if (moneyV2 == null) {
		return null;
	}

	return (
		<div>
			<Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />
		</div>
	);
}

export function CartEmpty({
	hidden = false,
	layout = "aside",
}: {
	hidden: boolean;
	layout?: CartMainProps["layout"];
}) {
	return (
		<div hidden={hidden}>
			<br />
			<p>
				Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
				started!
			</p>
			<br />
			<Link
				to="/collections"
				onClick={() => {
					if (layout === "aside") {
						window.location.href = "/collections";
					}
				}}
			>
				Continue shopping →
			</Link>
		</div>
	);
}

function CartDiscounts({
	discountCodes,
}: {
	discountCodes: CartApiQueryFragment["discountCodes"];
}) {
	const codes: string[] =
		discountCodes
			?.filter((discount) => discount.applicable)
			?.map(({ code }) => code) || [];

	return (
		<div>
			{/* Have existing discount, display it with a remove option */}
			<dl hidden={!codes.length}>
				<div>
					<dt>Discount(s)</dt>
					<UpdateDiscountForm>
						<div className="cart-discount">
							<code>{codes?.join(", ")}</code>
							&nbsp;
							<button type="button">Remove</button>
						</div>
					</UpdateDiscountForm>
				</div>
			</dl>

			{/* Show an input to apply a discount */}
			<UpdateDiscountForm discountCodes={codes}>
				<div>
					<input type="text" name="discountCode" placeholder="Discount code" />
					&nbsp;
					<button type="submit">Apply</button>
				</div>
			</UpdateDiscountForm>
		</div>
	);
}

function UpdateDiscountForm({
	discountCodes,
	children,
}: {
	discountCodes?: string[];
	children: React.ReactNode;
}) {
	return (
		<CartForm
			route="/cart"
			action={CartForm.ACTIONS.DiscountCodesUpdate}
			inputs={{
				discountCodes: discountCodes || [],
			}}
		>
			{children}
		</CartForm>
	);
}

function CartLineUpdateButton({
	children,
	lines,
}: {
	children: React.ReactNode;
	lines: CartLineUpdateInput[];
}) {
	return (
		<CartForm
			route="/cart"
			action={CartForm.ACTIONS.LinesUpdate}
			inputs={{ lines }}
		>
			{children}
		</CartForm>
	);
}
