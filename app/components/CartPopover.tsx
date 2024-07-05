import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { SlBag } from "react-icons/sl";
import {
	useOptimisticCart,
	OptimisticCart,
	useOptimisticData,
} from "@shopify/hydrogen";
import { type ReactNode, Suspense, useState } from "react";
import { Await, useLoaderData } from "@remix-run/react";
import type { CartApiQueryFragment } from "storefrontapi.generated";
import { getNumFromShopifyId } from "~/lib/shopify-util";
import type { optimisticQuantity } from "app/routes/products.$handle";
import { json, LoaderFunctionArgs } from "@remix-run/server-runtime";
import { LayoutProps } from "./Layout";
import { optimisticQuantityID } from "~/lib/CONST";

type CartPopOverProps = Pick<
	LayoutProps,
	"cart" | "children" | "quantityProps"
>;

export async function loader({ context }: LoaderFunctionArgs) {
	const cart = await context.cart.get();
	const totalQuantity = cart?.lines?.nodes?.reduce((acc, line) => {
		return acc + (line.quantity ?? 0);
	}, 0);
	return json({
		totalQuantity: totalQuantity,
	});
}

const extractTotalQuantity = ({ cart }: { cart: CartApiQueryFragment }) => {
	return cart.lines.edges.reduce((acc, line) => {
		return acc + (line.node.quantity ?? 0);
	}, 0);
};

const optimisticExtractTotalQuantity = ({
	optimisticCart,
}: {
	optimisticCart: OptimisticCart<Promise<CartApiQueryFragment | null>>;
}) => {
	if (!optimisticCart) return 0;
	return (
		optimisticCart.lines?.nodes?.reduce((acc, line) => {
			return acc + line.quantity;
		}, 0) ?? 0
	);
};

export const CartMenu = ({
	cart,
	children,
	quantityProps,
}: CartPopOverProps) => {
	const optimisticCart = useOptimisticCart(cart);
	const opstimisticQuantity = optimisticExtractTotalQuantity({
		optimisticCart: optimisticCart,
	});

	return (
		<Popover>
			<PopoverTrigger>
				<Suspense fallback={<CartIcon numberOfLines={opstimisticQuantity} />}>
					<Await resolve={cart}>
						{(cart) => {
							if (!cart) return <CartIcon numberOfLines={0} />;
							return (
								<CartIcon
									numberOfLines={
										extractTotalQuantity({ cart: cart }) + opstimisticQuantity
									}
								/>
							);
						}}
					</Await>
				</Suspense>
			</PopoverTrigger>
			<PopoverContent className="mr-[5dvw] mt-1 max-h-[80dvh]">
				<Suspense fallback={<div>hello</div>}>
					<Await resolve={cart}>
						{(cart) => {
							if (!cart) return <div>Cart is empty...</div>;
							let isNewItem = true;
							return (
								<div>
									{optimisticCart.isOptimistic &&
										optimisticCart.lines?.nodes?.map((line) => {
											const product = line.merchandise.product;
											return (
												<div key={product.id}>
													{product.title} | {line.quantity}
												</div>
											);
										})}
									{cart.lines.edges.map((line) => {
										const optimisticId = getNumFromShopifyId(
											optimisticCart.lines?.nodes[0]?.id ?? "",
										);
										const currentId = getNumFromShopifyId(
											line.node.merchandise.id,
										);
										if (optimisticId === currentId) return;

										const localOptimisticQuantity =
											optimisticId === currentId ? opstimisticQuantity : 0;
										const quantity =
											line.node.quantity + localOptimisticQuantity;
										const product = line.node.merchandise.product;
										return (
											<div key={product.id}>
												{product.title} | {quantity}
											</div>
										);
									})}
								</div>
							);
						}}
					</Await>
				</Suspense>
			</PopoverContent>
		</Popover>
	);
};

const CartIcon = ({
	numberOfLines,
	isOptimistic,
}: { numberOfLines: number; isOptimistic?: boolean }) => {
	return (
		<div className="flex w-8 h-8">
			<SlBag className="w-full h-full" />
			<p>{numberOfLines ?? "?"}</p>
		</div>
	);
};
