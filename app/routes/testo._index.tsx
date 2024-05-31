import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@shopify/remix-oxygen";

export async function loader({ request, context }: LoaderFunctionArgs) {
	return json({ hello: "hello" });
}

export default function Test() {
	const { hello } = useLoaderData<typeof loader>();

	return (
		<div className="flex">
			<h4>title on product</h4>

			<Carousel
				className="w-full max-w-sm"
				opts={{
					align: "start",
				}}
			>
				<CarouselContent>
					{Array.from([1, 2, 3, 4, 5, 6]).map((_image) => {
						return (
							<CarouselItem className="basis-1/3" key="dw">
								<span>a picture</span>
							</CarouselItem>
						);
					})}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
			<small>small money</small>
		</div>
	);
}
