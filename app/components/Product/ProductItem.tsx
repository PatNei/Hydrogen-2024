import type { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import { SeperatedBlockQuote } from "../Default/SeperatedBlockQuote";
import { ProductCard } from "./ProductCard";
import { NavLink } from "@remix-run/react";
import { Money } from "@shopify/hydrogen-react";
import { P } from "../Default/P";

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
			className={`flex overflow-hidden truncate mt-12 even:mt-14 break-inside-avoid first:my-0 flex-col gap-2 ${className}`}
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
			<SeperatedBlockQuote>
				<NavLink end to={variantUrl}>
					{({ isActive, isPending }) => {
						return (
							<div>
								<P className={`${isPending ? "transform scale-y-[-1]" : ""}`}>
									{product.title.toLowerCase()}
								</P>
								<Money data={product.priceRange.minVariantPrice} />
							</div>
						);
					}}
				</NavLink>
			</SeperatedBlockQuote>
		</div>
	);
}
