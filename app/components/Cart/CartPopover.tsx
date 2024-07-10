import { Input } from "@/components/ui/input";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Await, useSubmit } from "@remix-run/react";
import {
	CartForm,
	Money,
	type OptimisticCart,
	useOptimisticCart,
} from "@shopify/hydrogen";
import { ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { SlBag } from "react-icons/sl";
import type { CartApiQueryFragment } from "storefrontapi.generated";
import { Button } from "../Default/Button";
import { DeleteLineForm } from "../Forms/DeleteLineForm";
import { UpdateLineForm } from "../Forms/UpdateLineForm";
import type { defaultFormProps } from "../Forms/types";
import type { CartQuery } from "../Main/Layout";
import { ProductImage } from "../Product/ProductImage";

type CartProps = {
	cart: CartQuery;
};
export type CartLine = CartApiQueryFragment["lines"]["edges"][0]["node"];
export type CartLines = Array<CartLine>;
export const CartMenu = ({ cart }: CartProps) => {
	const optimisticCart = useOptimisticCart(cart);

	return (
		<Popover>
			<PopoverTrigger>
				{optimisticCart.isOptimistic ? (
					<OptimisticCartButton cart={cart} />
				) : (
					<CartButton cart={cart} />
				)}
			</PopoverTrigger>
			<PopoverContent className="mr-[5dvw] overscroll-contain w-[80dvw] sm:w-[44dvw] md:w-[40dvw] lg:w-[32dvw] max-w-[1000px] mt-1 max-h-[80dvh] p-4">
				<h1>Cart</h1>
				<CartContent cart={cart} />
			</PopoverContent>
		</Popover>
	);
};

const OptimisticCartContent = ({ cart }: CartProps) => {
	const optimisticCart = useOptimisticCart(cart);
	if (!optimisticCart?.lines?.nodes) return <EmptyCart />;
	return optimisticCart.lines.nodes.map((line) => {
		return (
			<CartItem optimisticCart={optimisticCart} key={line.id} line={line} />
		);
	});
};

const CartContent = ({ cart }: CartProps) => {
	const optimisticCart = useOptimisticCart(cart);
	return (
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
									<p className="">
										Total: <Money data={cart.cost.totalAmount} />
									</p>
									<Button>go to cart</Button>
									<Button>checkout</Button>
								</div>
							</ScrollArea>
						);
					}}
				</Await>
			</Suspense>
		</div>
	);
};

const CartButton = ({ cart }: CartProps) => {
	return (
		<Suspense fallback={<CartIcon />}>
			<Await resolve={cart}>
				{(cart) => {
					if (!cart) return <CartIcon />;
					const nodes = cart.lines.edges.map((edge) => {
						return edge.node;
					});
					const amountOfLines = extractTotalQuantity(nodes);
					return <CartIcon amount={amountOfLines} />;
				}}
			</Await>
		</Suspense>
	);
};

const OptimisticCartButton = ({ cart }: CartProps) => {
	const optimisticCart = useOptimisticCart(cart);
	const amountOfLines = extractTotalQuantity(optimisticCart.lines?.nodes);
	return <CartIcon amount={amountOfLines} text="+" />;
};

const CartItem = ({
	line,
	optimisticCart,
}: { line: CartLine } & Pick<defaultFormProps, "optimisticCart">) => {
	const {
		title,
		price,
		product,
		selectedOptions,
		image,
		id: merchandiseId,
	} = line.merchandise;
	const variantTitle = title.toLowerCase() === "default title" ? "" : title;
	const quantity = line.quantity;

	return (
		<div className=" flex m-2 flex-col" key={merchandiseId}>
			<UpdateLineForm optimisticCart={optimisticCart} line={line} />
			<ProductImage
				width={50}
				height={50}
				productTitle={product.title}
				image={image ?? undefined}
			/>
			<p>{variantTitle}</p>
			<p>{product.title}</p>
			<p>
				{price.currencyCode} {price.amount} x {quantity}
			</p>
			<DeleteLineForm optimisticCart={optimisticCart} line={line} />
		</div>
	);
};

const EmptyCart = () => {
	return <div>The cart is empty...</div>;
};

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
				<p className="text-center">
					{text}
					{over99 ? "+99" : amount}
				</p>
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
