import React from "react";

type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement> & {
	disableLowerCase?: boolean;
	isActive?: boolean;
	isPending?: boolean;
	isTransitioning?: boolean;
};

export const P = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
	function P(props, ref) {
		return (
			<p
				{...props}
				ref={ref}
				className={`${props.disableLowerCase ? "" : "lowercase"} text-base font-normal ${props.isActive || props.isPending || props.isTransitioning ? "transform-cpu scale-y-[-1] underline" : ""} ${props.className ?? ""}`}
			/>
		);
	},
);
