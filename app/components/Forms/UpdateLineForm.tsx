import { Input } from "@/components/ui/input";
import { useSubmit } from "@remix-run/react";
import { CartForm } from "@shopify/hydrogen";
import { useEffect, useState } from "react";
import { Button } from "../Default/Button";
import type { defaultFormProps } from "./types";

export const UpdateLineForm = ({
	lineId,
	merchandiseId,
	quantity,
	optimisticCart,
}: {
	merchandiseId: string;
	quantity: number;
} & defaultFormProps) => {
	const isOptimistic = optimisticCart.isOptimistic;
	//TODO: refactor to use useFetcher instead of this
	const [tempValue, setTempValue] = useState(quantity);
	const tempValueInvalid =
		tempValue < 0 || Number.isNaN(tempValue) || tempValue === quantity;
	const submit = useSubmit();
	// Sync tempValue with quantity if quantity changes, this happens when you add to cart without reloading the page.
	useEffect(() => {
		setTempValue(quantity);
	}, [quantity]);
	return (
		<CartForm
			route="/cart"
			action={CartForm.ACTIONS.LinesUpdate}
			inputs={{
				lines: [
					{
						id: lineId,
						merchandiseId: merchandiseId, // forgot this and it wouldn't submit
						quantity: tempValue,
					},
				],
			}}
		>
			<IncrementDecrementButtons
				incrementFunction={() => {
					setTempValue((prev) => {
						return prev + 1;
					});
				}}
				decrementFunction={() => {
					setTempValue((prev) => {
						return prev - 1;
					});
				}}
				isOptimistic={!!isOptimistic}
			/>
			<Input
				className=" border-none p-1 m-0 max-w-12 accent-transparent focus-visible:ring-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				inputMode="numeric"
				required={true}
				min={0}
				max={50}
				type="number"
				onInput={(event) => {
					setTempValue(event.currentTarget.valueAsNumber);
				}}
				onMouseOver={(event) => {
					// TODO: Might need similar functionality for mobile version. Not tested.
					event.currentTarget.focus();
				}}
				onKeyDown={(event) => {
					// Submission keys can be defined in the array in lowercase.
					// Currently only enter key that allows for submission.
					if (["enter"].includes(event.key.toLowerCase())) {
						submit(event.currentTarget);
					}
				}}
				defaultValue={quantity}
				value={tempValue}
			/>
			<Button
				type="submit"
				disabled={tempValueInvalid}
				hidden={tempValueInvalid}
				className={` ${tempValueInvalid ? "hidden" : ""}`}
			>
				Update 👍
			</Button>
		</CartForm>
	);
};

const IncrementDecrementButtons = ({
	isOptimistic,
	incrementFunction,
	decrementFunction,
}: {
	isOptimistic: boolean;
	incrementFunction: React.MouseEventHandler<HTMLButtonElement> | undefined;
	decrementFunction: React.MouseEventHandler<HTMLButtonElement> | undefined;
}) => {
	return (
		<div className="h-4 flex gap-4 justify-end">
			<Button
				disabled={isOptimistic}
				className="text-xl"
				onClick={incrementFunction}
				onKeyDown={(event) => {
					event.preventDefault();
				}}
				type="submit"
			>
				+
			</Button>
			<Button
				disabled={isOptimistic}
				className="text-xl"
				onClick={decrementFunction}
				onKeyDown={(event) => {
					event.preventDefault();
				}}
				type="submit"
			>
				-
			</Button>
		</div>
	);
};
