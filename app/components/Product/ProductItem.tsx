import type { ProductItemFragment } from "storefrontapi.generated";
import { useVariantUrl } from "~/lib/variants";
import { SeperatedBlockQuote } from "../Default/SeperatedBlockQuote";
import { ProductCard } from "./ProductCard";

export function ProductItem({
	product,
	loading,
}: {
	product: ProductItemFragment;
	loading?: "eager" | "lazy";
	className?: string;
}) {
	const variant = product.variants.nodes[0];
	const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
	return (
		<div className="flex overflow-hidden truncate mt-12 even:mt-14 break-inside-avoid first:my-0 flex-col gap-4">
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
				<p>{product.title}</p>
			</SeperatedBlockQuote>
		</div>
	);
}
