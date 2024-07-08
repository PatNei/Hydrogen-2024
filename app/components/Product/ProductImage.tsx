import type { HydrogenImageProps } from "@shopify/hydrogen-react/Image";
import placeholderImage from "../../assets/placeholder.webp";

const IMAGE_PRODUCT_WIDTH = 1080;
const IMAGE_PRODUCT_HEIGHT = 1620;

export type ProductImageProps = {
	productTitle: string;
	invisible?: boolean;
	image?: HydrogenImageProps["data"];
	height?: number;
	width?: number;
	className?: string;
};

export const ProductImage = ({
	image,
	productTitle,
	invisible = false,
	width = IMAGE_PRODUCT_WIDTH,
	height = IMAGE_PRODUCT_HEIGHT,
	className = "",
}: ProductImageProps) => {
	if (!image)
		return (
			<ProductImage
				invisible={invisible}
				height={height}
				width={width}
				productTitle={productTitle}
				className={className}
				image={{
					id: "image-placeholder",
					url: placeholderImage,
					altText: "placeholder image",
				}}
			/>
		);

	return (
		<img
			className={`${className}`}
			hidden={invisible}
			key={image.id}
			height={height}
			width={width}
			alt={`${productTitle}-${image.altText}`}
			src={invisible ? "" : image.url}
			aria-hidden={invisible}
		/>
	);
};
