import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { AspectRatioProps } from "@radix-ui/react-aspect-ratio";

export const StyledAspectRatio = (props: AspectRatioProps) => {
	return (
		<AspectRatio
			ratio={props.ratio}
			className={`max-h-fit max-w-fit ${props.className ?? ""}`}
		>
			{props.children}
		</AspectRatio>
	);
};
