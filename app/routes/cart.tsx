import { Await, useLoaderData, type MetaFunction } from "@remix-run/react";
import { Suspense } from "react";
import type { CartQueryDataReturn } from "@shopify/hydrogen";
import { CartForm, useOptimisticCart } from "@shopify/hydrogen";
import {
	LoaderFunctionArgs,
	defer,
	json,
	type ActionFunctionArgs,
} from "@shopify/remix-oxygen";
import { CartMain } from "~/components/Cart";
import { useRootLoaderData } from "~/lib/root-data";
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
	const cart = useOptimisticCart(data.cart);
	return (
		<div className="cart">
			<h1>Cart</h1>
			<CartMain layout="page" cart={cart} />
		</div>
	);
}
