import { Link } from "@remix-run/react";
import { Money } from "@shopify/hydrogen";
import type { ProductItemFragment } from "storefrontapi.generated";
import { StyledAspectRatio } from "../Default/StyledAspectRatio";
import { ProductImage, type ProductImageProps } from "./ProductImage";

type CarouselProductItemProps = {
	product: ProductItemFragment;
	variantUrl: string;
	productImageProps: ProductImageProps;
	className?: string;
};

export const ProductCard = ({
	product,
	variantUrl,
	productImageProps,
	className = "",
}: CarouselProductItemProps) => {
	return (
		<div className="min-h-full h-full w-full text-nowrap">
			<div
				className={`min-w-full max-w-full min-h-full h-full w-full relative ${className}`}
			>
				<Link
					key={product.id}
					className="min-w-full max-w-full w-full min-h-full max-h-full h-full peer"
					prefetch="intent"
					to={variantUrl}
					hidden={productImageProps.invisible}
				>
					<ProductImage
						{...productImageProps}
						className="min-w-full max-w-full w-full min-h-full max-h-full h-fullabsolute top-0 left-0"
					/>
				</Link>
				{/* <div
					className="hidden peer-hover:flex
			transition ease-in-out delay-300 duration-150 flex-col gap-0 opacity-80 bg-black h-min max-h-min absolute bottom-0 left-0 text-center w-full min-w-full max-w-full text-white"
				>
					<h1 className="h-full max-h-full">{product.title.toLowerCase()}</h1>
					<Money
						className="h-full max-h-full"
						data={product.priceRange.minVariantPrice}
					/>
				</div> */}
			</div>
		</div>
	);
};
