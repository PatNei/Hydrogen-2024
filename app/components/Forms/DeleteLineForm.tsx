import { CartForm } from "@shopify/hydrogen";
import { Button } from "../Default/Button";
import type { defaultFormProps } from "./types";

export const DeleteLineForm = ({
	lineId,
	optimisticCart,
}: defaultFormProps) => {
	return (
		<CartForm
			route="/cart"
			action={CartForm.ACTIONS.LinesRemove}
			inputs={{ lineIds: [lineId] }}
		>
			<Button type="submit">Delete</Button>
		</CartForm>
	);
};
