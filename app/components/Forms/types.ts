import type { OptimisticCart } from "@shopify/hydrogen";
import type { CartQuery } from "../Main/Layout";

export type defaultFormProps = {
	optimisticCart: OptimisticCart<CartQuery>;
	lineId: string;
};
