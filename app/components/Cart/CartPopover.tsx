import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { SlBag } from "react-icons/sl";
import { useOptimisticCart, type OptimisticCart } from "@shopify/hydrogen";
import type { CartApiQueryFragment } from "storefrontapi.generated";
import type { CartQuery } from "../Main/Layout";
import { Suspense } from "react";
import { Await } from "@remix-run/react";
import { ProductImage } from "../Product/ProductImage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

type CartProps = {
	cart: CartQuery;
};
type CartLine = CartApiQueryFragment["lines"]["edges"][0]["node"];
type CartLines = Array<CartLine>;
export const CartMenu = ({ cart }: CartProps) => {
	const optimisticCart = useOptimisticCart(cart);

	return (
		<Popover open={true}>
			<PopoverTrigger>
				{optimisticCart.isOptimistic ? (
					<OptimisticCartButton cart={cart} />
				) : (
					<CartButton cart={cart} />
				)}
			</PopoverTrigger>
			<PopoverContent className="mr-[5dvw] w-[90dvw] sm:w-[32dvw] mt-1 max-h-[80dvh]">
				<ScrollArea className="h-[60dvh] rounded-sm w-full">
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
						if (!cart?.lines?.edges) return <EmptyCart />;

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
					return <CartIcon amount={`${amountOfLines}`} />;
				}}
			</Await>
		</Suspense>
	);
};

const OptimisticCartButton = ({ cart }: CartProps) => {
	const optimisticCart = useOptimisticCart(cart);
	const amountOfLines = extractTotalQuantity(optimisticCart.lines?.nodes);
	return <CartIcon amount={`+${amountOfLines}`} />;
};

const CartItem = ({ line }: { line: CartLine }) => {
	const { title, price, product, selectedOptions, image } = line.merchandise;
	const variantTitle = title.toLowerCase() === "default title" ? "" : title;
	return (
		<div className=" flex m-2 flex-col" key={line.id}>
			<Input
				className=" border-none p-1 m-0 max-w-12 accent-transparent focus-visible:ring-transparent"
				inputMode="numeric"
				min={0}
				max={50}
				type="number"
				defaultValue={line.quantity}
				placeholder={line.quantity.toString()}
			/>
			<ProductImage
				width={50}
				height={50}
				productTitle={product.title}
				image={image ?? undefined}
			/>
			<div>x{line.quantity}</div>
			<div>{variantTitle}</div>
			<div>{product.title}</div>
			<div>
				{price.currencyCode} {price.amount}
			</div>
		</div>
	);
};

const EmptyCart = () => {
	return <div>The cart is empty...</div>;
};

const CartIcon = ({ amount }: { amount?: string }) => {
	return (
		<div className="flex w-8 h-8 relative">
			<SlBag className="w-full h-full" />
			<div className="absolute bg-white w-fit max-w-10 -bottom-2 -right-2">
				<p className="">{amount ?? "0"}</p>
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
