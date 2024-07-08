import { NavLink } from "@remix-run/react";
import type {
	CartApiQueryFragment,
	FooterQuery,
	HeaderQuery,
} from "storefrontapi.generated";
import { Header, getHeaderNavLinkStyle } from "~/components/Main/Header";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { FaQuestion } from "react-icons/fa6";

type quantityProps = {
	totalQuantity: number;
	setTotalQuantity: React.Dispatch<React.SetStateAction<number>>;
};

export type CartQuery = Promise<CartApiQueryFragment | null>;
export type LayoutProps = {
	cart: CartQuery;
	footer: Promise<FooterQuery>;
	header: HeaderQuery;
	children?: React.ReactNode;
};

export function Layout({ cart, children = null, footer, header }: LayoutProps) {
	return (
		<>
			{/* <CartAside cart={cart} />
			<SearchAside />
			<MobileMenuAside menu={header?.menu} shop={header?.shop} /> */}
			<div className="flex gap-2 mt-2 sm:mt-4 px-2 flex-row max-w-screen min-w-screen w-screen">
				<div className="flex min-w-[5dvw] w-[5dvw] max-w-[5dvw] sm:max-w-[5dvw] sm:min-w-[5dvw] sm:w-[5dvw] justify-center">
					{/* <ShopIcon
						className="sticky w-5 max-h-2 pt-4 top-0 left-0"
						header={header}
					/> */}
				</div>
				<div className="w-[90dvw] max-w-[90dvw] pr-4 min-w-[90dvw]">
					<div className="pt-4 z-10 bg-white min-h-[12dvh]">
						{header && <Header header={header} cart={cart} />}
					</div>
					<main>{children}</main>
				</div>
			</div>
			{/* <div>
					<Suspense>
						<Await resolve={footer}>
							{(footer) => <Footer menu={footer?.menu} shop={header?.shop} />}
						</Await>
					</Suspense>
				</div> */}
		</>
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
				return `sticky ${className} ${getHeaderNavLinkStyle(props)}`;
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
