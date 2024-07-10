import { CartForm } from "@shopify/hydrogen";
import { Button } from "../Default/Button";
import type { defaultFormProps } from "./types";

export const DeleteLineForm = ({
	line,
	optimisticCart,
}: defaultFormProps) => {
	return (
		<CartForm
			route="/cart"
			action={CartForm.ACTIONS.LinesRemove}
			inputs={{ lineIds: [line.id] }}
		>
			<Button type="submit">Delete</Button>
		</CartForm>
	);
};
