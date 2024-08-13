import type { ProductItemFragment } from "storefrontapi.generated";
import { ProductImage, type ProductImageProps } from "./ProductImage";
import { NavLink } from "@remix-run/react";

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
				<NavLink
					key={product.id}
					className="min-w-full max-w-full w-full min-h-full max-h-full h-full peer"
					prefetch="intent"
					to={variantUrl}
					hidden={productImageProps.invisible}
				>
					{({ isActive, isPending, isTransitioning }) => (
						<ProductImage
							{...productImageProps}
							className={`min-w-full max-w-full w-full min-h-full max-h-full h-full top-0 left-0 ${isPending || isActive || isTransitioning ? "transform-cpu scale-y-[-1]" : ""}`}
						/>
					)}
				</NavLink>

				{/* <ProductImage
							{...productImageProps}
							className={`min-w-full max-w-full w-full min-h-full max-h-full h-full top-0 left-0 ${isPending || isActive  ? "transform scale-y-[-1]" : ""}`}
						/> */}
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
