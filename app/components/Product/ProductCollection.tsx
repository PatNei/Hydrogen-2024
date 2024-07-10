import { Pagination } from "@shopify/hydrogen";
import React from "react";
import type { CatalogQuery } from "storefrontapi.generated";
import { ProductsGrid } from "./ProductGrid";

export const Collection = ({ _products }: { _products: CatalogQuery }) => {
	// TODO: I arrived at this mess. I will try to use a fetcher instead to get the requiredData
	return (
		<div className="flex flex-col max-w-full gap-4 mt-2">
			{
				// biome-ignore lint/style/noCommaOperator: <explanation>
				(React.forwardRef < React.FC<Pagination>,
				React.ComponentProps<typeof Pagination>(() => {}))
			}
			<Pagination connection={_products}>
				{({ nodes, isLoading, PreviousLink, NextLink }) => (
					<>
						<PreviousLink>
							{isLoading ? "Loading..." : <span>↑ Load previous</span>}
						</PreviousLink>
						<ProductsGrid products={nodes} />
						<NextLink>
							{isLoading ? "Loading..." : <span>Load more ↓</span>}
						</NextLink>
					</>
				)}
			</Pagination>
		</div>
	);
};
