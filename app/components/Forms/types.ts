import type { OptimisticCart } from "@shopify/hydrogen";
import type { CartQuery } from "../Main/PageLayout";
import type { CartLine } from "../Cart/CartPopover";

export type defaultFormProps = {
	optimisticCart: OptimisticCart<CartQuery>;
	line: CartLine;
};
