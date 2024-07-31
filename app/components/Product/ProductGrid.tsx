import type { ReactNode } from "react";

export function ProductsGrid({
	children,
	itemAmount,
}: { children: ReactNode; itemAmount: number }) {
	return (
		<div
			className={
				"columns-1 gap-12 break-inside-avoid-column clear-both sm:columns-2 sm:max-w-fit odd:float-right even:float-left xxl:columns-3"
			}
		>
			{children}
		</div>
	);
}
