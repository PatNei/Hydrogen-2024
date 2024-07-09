import { CartForm } from "@shopify/hydrogen";
import { Button } from "../Default/Button";

export const DeleteLineForm = ({ lineId }: { lineId: string }) => {
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
