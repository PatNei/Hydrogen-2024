import type { HydrogenImageProps } from "@shopify/hydrogen-react/Image";
import placeholderImage from "../assets/placeholder.webp";

const IMAGE_PRODUCT_WIDTH = 1920;
const IMAGE_PRODUCT_HEIGHT = 1080;

export type ProductImageProps = {
	productTitle: string;
	invisible?: boolean;
	image?: HydrogenImageProps["data"];
	height?: number;
	width?: number;
	className?: string;
};

export const ProductImage = ({
	productTitle,
	image,
	invisible = false,
	width = IMAGE_PRODUCT_WIDTH,
	height = IMAGE_PRODUCT_HEIGHT,
	className = "",
}: ProductImageProps) => {
	return (
		<img
			className={`min-w-full max-w-full w-full min-h-full max-h-full h-full ${className}`}
			hidden={invisible}
			key={image?.id ?? "image-placeholder"}
			height={height}
			width={width}
			alt={`${productTitle}-${image?.altText ?? "placeholder"}`}
			src={invisible ? "" : image?.url ?? placeholderImage}
			aria-hidden={invisible}
		/>
	);
};
