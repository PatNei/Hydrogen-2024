import type { ProductItemFragment } from "storefrontapi.generated";
import { ProductItem } from "./ProductItem";

export function ProductsGrid({
	products,
}: { products: ProductItemFragment[] }) {
	return (
		<div className="columns-1 break-inside-avoid-column clear-both sm:columns-2 lg:columns-3 odd:float-right even:float-left max-w-full">
			{products.map((product, index) => {
				return (
					<ProductItem
						key={product.id}
						product={product}
						loading={index < 8 ? "eager" : undefined}
					/>
				);
			})}
		</div>
	);
}
