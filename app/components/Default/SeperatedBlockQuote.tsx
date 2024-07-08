import type { ReactNode } from "react";

export const SeperatedBlockQuote = ({
	children,
	className = "",
}: { children: ReactNode; className?: string }) => {
	return (
		<div
			className={`flex divide-x divide-black flex-row max-h-max h-fit min-h-min text-balance max-w-full w-full align-middle text-middle ${className}`}
		>
			<div className="max-w-2 h-full" />
			<blockquote className="h-full pl-3 leading-line w-full text-pretty">
				{children}
			</blockquote>
		</div>
	);
};
