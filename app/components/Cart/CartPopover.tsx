import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { SlBag } from "react-icons/sl";
import {
	CartForm,
	useOptimisticCart,
	type OptimisticCart,
} from "@shopify/hydrogen";
import type { CartApiQueryFragment } from "storefrontapi.generated";
import type { CartQuery } from "../Main/Layout";
import { ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { Await, useSubmit } from "@remix-run/react";
import { ProductImage } from "../Product/ProductImage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CartProps = {
	cart: CartQuery;
};
type CartLine = CartApiQueryFragment["lines"]["edges"][0]["node"];
type CartLines = Array<CartLine>;
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
			<PopoverContent className="mr-[5dvw] overscroll-contain w-[90dvw] sm:w-[32dvw] mt-1 max-h-[80dvh]">
				<ScrollArea className="h-min overflow-scroll max-h-[60dvh] rounded-sm w-full">
					<CartContent cart={cart} />
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
};

const OptimisticCartContent = ({ cart }: CartProps) => {
	const optimisticCart = useOptimisticCart(cart);
	if (!optimisticCart?.lines?.nodes) return <EmptyCart />;
	return optimisticCart.lines.nodes.map((line) => {
		return <CartItem key={line.id} line={line} />;
	});
};

const CartContent = ({ cart }: CartProps) => {
	return (
		<div className="max-h-full w-full">
			<Suspense fallback={<EmptyCart />}>
				<Await resolve={cart}>
					{(cart) => {
						if (!cart?.lines?.edges || cart.lines.edges.length < 1)
							return <EmptyCart />;

						return cart.lines.edges.map((edge) => {
							const line = edge.node;
							return <CartItem key={line.id} line={line} />;
						});
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

const CartItem = ({ line }: { line: CartLine; isOptimistic?: boolean }) => {
	const { title, price, product, selectedOptions, image } = line.merchandise;
	const variantTitle = title.toLowerCase() === "default title" ? "" : title;
	const quantity = line.quantity;
	const [tempValue, setTempValue] = useState(quantity);
	const tempValueInvalid =
		tempValue < 0 || Number.isNaN(tempValue) || tempValue === quantity;
	const submit = useSubmit();
	// Sync tempValue with quantity if quantity changes, this happens when you add to cart without reloading the page.
	useEffect(() => {
		setTempValue(quantity);
	}, [quantity]);
	return (
		<div className=" flex m-2 flex-col" key={line.id}>
			<CartForm
				route="/cart"
				action={CartForm.ACTIONS.LinesUpdate}
				inputs={{
					lines: [
						{
							id: line.id,
							merchandiseId: line.merchandise.id, // forgot this and it wouldn't submit
							quantity: tempValue,
						},
					],
				}}
			>
				<Input
					className=" border-none p-1 m-0 max-w-12 accent-transparent focus-visible:ring-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					inputMode="numeric"
					required={true}
					min={0}
					max={50}
					type="number"
					onInput={(event) => {
						setTempValue(event.currentTarget.valueAsNumber);
					}}
					onMouseOver={(event) => {
						// TODO: Might need similar functionality for mobile version. Not tested.
						event.currentTarget.focus();
					}}
					onKeyDown={(event) => {
						// Submission keys can be defined in the array in lowercase.
						// Currently only enter key that allows for submission.
						if (["enter"].includes(event.key.toLowerCase())) {
							submit(event.currentTarget);
						}
					}}
					defaultValue={quantity}
					value={tempValue}
				/>
				<Button
					variant={"ghost"}
					type="submit"
					disabled={tempValueInvalid}
					hidden={tempValueInvalid}
					className={` ${tempValueInvalid ? "hidden" : ""}`}
				>
					Update 👍
				</Button>
			</CartForm>
			<ProductImage
				width={50}
				height={50}
				productTitle={product.title}
				image={image ?? undefined}
			/>
			<div>x{quantity}</div>
			<div>{variantTitle}</div>
			<div>{product.title}</div>
			<div>
				{price.currencyCode} {price.amount}
			</div>
			<CartForm
				route="/cart"
				action={CartForm.ACTIONS.LinesRemove}
				inputs={{ lineIds: [line.id] }}
			>
				<Button variant={"ghost"} type="submit">
					Delete
				</Button>
			</CartForm>
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
