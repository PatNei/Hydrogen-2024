import { ScrollArea } from "@/components/ui/scroll-area";
import type { MetaFunction } from "@remix-run/react";
import { Await, Link } from "@remix-run/react";
import { CartForm, Image, Money, useOptimisticCart } from "@shopify/hydrogen";
import type { CartQueryDataReturn } from "@shopify/hydrogen";
import type { CartLineUpdateInput } from "@shopify/hydrogen/storefront-api-types";
import { type ActionFunctionArgs, json } from "@shopify/remix-oxygen";
import { Suspense } from "react";
import { SlBag } from "react-icons/sl";
import type { CartApiQueryFragment } from "storefrontapi.generated";
import {
	CartItem,
	EmptyCart,
	type CartLine,
	type CartLines,
} from "~/components/Cart/CartPopover";
import { Button } from "~/components/Default/Button";
import { P } from "~/components/Default/P";
import { useRootLoaderData } from "~/lib/root-data";
import { useVariantUrl } from "~/lib/variants";
export const meta: MetaFunction = () => {
	return [{ title: "Hydrogen | Cart" }];
};

export async function action({ request, context }: ActionFunctionArgs) {
	const { cart } = context;
	const formData = await request.formData();
	const { action, inputs } = CartForm.getFormInput(formData);

	let status = 200;
	let result: CartQueryDataReturn;
	switch (action) {
		case CartForm.ACTIONS.LinesAdd:
			result = await cart.addLines(inputs.lines);
			break;
		case CartForm.ACTIONS.LinesUpdate:
			result = await cart.updateLines(inputs.lines);
			break;
		case CartForm.ACTIONS.LinesRemove:
			result = await cart.removeLines(inputs.lineIds);
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

	const headers = cart.setCartId(result.cart.id);
	const redirectTo = formData.get("redirectTo") ?? null;

	if (typeof redirectTo === "string") {
		status = 303;
		headers.set("Location", redirectTo);
	}

	return json(
		{
			result,
			analytics: result.cart.id,
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
	const optimisticCart = useOptimisticCart(cart);
	// const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
	// const withDiscount =
	// 	cart &&
	// 	Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
	// const className = `cart-main ${withDiscount ? "with-discount" : ""}`;
	return (
		<div className="max-w-44">
			<div className="max-h-full w-full">
				<Suspense fallback={<EmptyCart />}>
					<Await resolve={cart}>
						{(cart) => {
							if (!cart?.lines?.edges || cart.lines.edges.length < 1)
								return <EmptyCart />;

							return (
								<ScrollArea className="h-min overflow-scroll max-h-[60dvh] rounded-sm w-full pr-2 flex flex-col relative">
									{cart.lines.edges.map((edge) => {
										const line = edge.node;
										return (
											<CartItem
												optimisticCart={optimisticCart}
												key={line.id}
												line={line}
											/>
										);
									})}
									<div className="sticky bottom-0 top-0 bg-white flex flex-col pt-4">
										<P className="">
											Total: <Money data={cart.cost.totalAmount} />
										</P>
										<Button>go to cart</Button>
										<Button>
											<Link to={cart.checkoutUrl}>checkout</Link>
										</Button>
									</div>
								</ScrollArea>
							);
						}}
					</Await>
				</Suspense>
			</div>
			{/* <CartEmpty hidden={linesCount} layout={layout} />
			<CartDetails cart={cart} layout={layout} /> */}
		</div>
	);
}

const CartIcon = ({ amount = 0, text }: { amount?: number; text?: string }) => {
	const over99 = amount > 99;
	const over10 = amount > 9;
	return (
		<div className="flex w-8 h-8 relative">
			<SlBag className="w-full h-full" />
			<div
				className={`p-[3px] absolute rounded-lg bg-white w-fit max-w-10 -bottom-3 ${
					over99 ? "-right-2.5" : over10 ? "-right-1.5" : "right-0"
				}`}
			>
				<P className="text-center">
					{text}
					{over99 ? "+99" : amount}
				</P>
			</div>
		</div>
	);
};

const extractTotalQuantity = (lines: CartLines) => {
	if (!lines) return 0;
	return lines.reduce((acc, line) => {
		return acc + line.quantity;
	}, 0);
};

function CartLineItem({
	line,
}: {
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
				<Link prefetch="intent" to={lineItemUrl}>
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
