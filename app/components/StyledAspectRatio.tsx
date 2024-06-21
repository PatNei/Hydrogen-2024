import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { AspectRatioProps } from "@radix-ui/react-aspect-ratio";

export const StyledAspectRatio = (props: AspectRatioProps) => {
	return (
		<AspectRatio
			ratio={props.ratio}
			className={`bg-black min-w-full max-w-full w-full min-h-full max-h-full h-full ${props.className}`}
		>
			{props.children}
		</AspectRatio>
	);
};
