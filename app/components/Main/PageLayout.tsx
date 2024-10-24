import { AspectRatio } from "@/components/ui/aspect-ratio";
import { NavLink } from "@remix-run/react";
import { FaQuestion } from "react-icons/fa6";
import type {
	CartApiQueryFragment,
	FooterQuery,
	HeaderQuery,
} from "storefrontapi.generated";
import { Header, getHeaderNavLinkStyle } from "~/components/Main/Header";
import type { CartQuery } from "~/graphql/CartQuery";
import { RootLoader } from "~/root";

export type LayoutProps = {
	cart: CartQuery;
	footer: Promise<FooterQuery>;
	header: Promise<HeaderQuery>;
	children?: React.ReactNode;
};

export function PageLayout({
	children
}: {children?:React.ReactNode}) {
	return (
		<div className="flex gap-1 flex-col px-14 h-full pt-[4dvh] max-w-full">
			<Header className="h-[10dvh]" />
			<main className="max-h-[86dvh]">{children}</main>
		</div>
	);
}
const ShopIcon = ({
	header,
	className,
}: { header: HeaderQuery; className?: string }) => {
	return (
		<NavLink
			prefetch="intent"
			to="/"
			className={(props) => {
				return `${className} ${getHeaderNavLinkStyle(props)}`;
			}}
			end
		>
			{header.shop?.brand?.logo?.image?.url ? (
				<AspectRatio ratio={1 / 1}>
					<img
						width={500}
						height={500}
						src={header.shop.brand.logo.image.url}
						alt={`Logo for ${header.shop.name}`}
					/>
				</AspectRatio>
			) : (
				<FaQuestion height={500} width={500} className="" />
			)}
		</NavLink>
	);
};
