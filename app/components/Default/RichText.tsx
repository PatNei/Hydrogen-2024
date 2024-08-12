import { RichText as RichText_ } from "@shopify/hydrogen";
// import type { RichTextProps } from "@shopify/hydrogen-react/RichText";

export const RichText = ({ metaFieldData }: { metaFieldData: string }) => {
	return (
		<RichText_
			data={metaFieldData}
			components={{
				paragraph({ node }) {
					return <P className="customClass">{node.children}</P>;
				},
			}}
		/>
	);
};
