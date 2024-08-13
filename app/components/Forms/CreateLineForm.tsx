import { CartForm, useOptimisticCart } from "@shopify/hydrogen";
import type { ProductFragment } from "storefrontapi.generated";
import { Button } from "../Default/Button";
import type { defaultFormProps } from "./types";

export const CreateLineForm = ({
	selectedVariant,
	optimisticCart,
}: {
	selectedVariant: ProductFragment["selectedVariant"];
} & Pick<defaultFormProps, "optimisticCart">) => {
	const amount = 9;
	const isOptimistic = optimisticCart.isOptimistic;
	return (
		<CartForm
			route="/cart"
			action={CartForm.ACTIONS.LinesAdd}
			inputs={{
				lines: [
					{
						merchandiseId: selectedVariant?.id ?? "",
						quantity: amount,
						selectedVariant: selectedVariant,

						// The whole selected variant is not needed on the server, used in
						// the client to render the product until the server action resolves
					},
				],
			}}
		>
			<Button
				className="w-24"
				variant={"default"}
				disabled={isOptimistic}
				type="submit"
			>
				{isOptimistic ? "..." : "ADD"}
			</Button>
		</CartForm>
	);
};
