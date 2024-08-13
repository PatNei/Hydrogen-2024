import type { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import { SeperatedBlockQuote } from "../Default/SeperatedBlockQuote";
import { ProductCard } from "./ProductCard";
import { Money } from "@shopify/hydrogen-react";
import { P } from "../Default/P";
import { NavLinkP } from "../Remix/NavLink";

export function ProductItem({
	product,
	loading,
	isLoading,
	className,
}: {
	product: ProductItemFragment;
	loading?: "eager" | "lazy";
	isLoading?: boolean;
	className?: string;
}) {
	const variant = product.variants.nodes[0];
	const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
	return (
		<div
			className={`flex overflow-hidden mt-4 even:mt-5 break-inside-avoid first:my-0 flex-col border-4 p-2 ${className}`}
		>
			{product.images.nodes.length > 0 ? (
				product.images.nodes.map((_image, index) => {
					if (index >= 1) {
						return;
					}
					return (
						<ProductCard
							className="first:mt-0"
							key={`CPI-${_image.id}`}
							product={product}
							variantUrl={variantUrl}
							productImageProps={{ image: _image, productTitle: product.title }}
						/>
					);
				})
			) : (
				<ProductCard
					product={product}
					productImageProps={{ productTitle: product.title }}
					variantUrl={variantUrl}
				/>
			)}
				<NavLinkP end to={variantUrl}>
							<div className="w-full flex justify-between	pt-2 p-1">
								<P className={"w-2/3"}>
									{product.title.toLowerCase()} 
								</P>
								<Money className="text-base lowercase" data={product.priceRange.minVariantPrice} />
							</div>
				</NavLinkP>
		</div>
	);
}
