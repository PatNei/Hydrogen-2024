import { Link, useLoaderData } from "@remix-run/react";
import { Image, Pagination, getPaginationVariables } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";
import type { CollectionFragment } from "storefrontapi.generated";
import { COLLECTIONS_QUERY } from "~/graphql/products/CollectionsQuery";

export async function loader({ context, request }: LoaderFunctionArgs) {
	const paginationVariables = getPaginationVariables(request, {
		pageBy: 4,
	});

	const { collections } = await context.storefront.query(COLLECTIONS_QUERY, {
		variables: paginationVariables,
	});

	return json({ collections });
}

export default function Collections() {
	const { collections } = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col gap-2 mt-4">
			<h1 className="text-lg">Collections</h1>
			<Pagination connection={collections}>
				{({ nodes, isLoading, PreviousLink, NextLink }) => (
					<div>
						<PreviousLink>
							{isLoading ? "Loading..." : <span>↑ Load previous</span>}
						</PreviousLink>
						<CollectionsGrid collections={nodes} />
						<NextLink>
							{isLoading ? "Loading..." : <span>Load more ↓</span>}
						</NextLink>
					</div>
				)}
			</Pagination>
		</div>
	);
}

function CollectionsGrid({
	collections,
}: { collections: CollectionFragment[] }) {
	return (
		<div className="flex flex-col gap-2 ">
			{collections.map((collection, index) => (
				<CollectionItem
					key={collection.id}
					collection={collection}
					index={index}
				/>
			))}
		</div>
	);
}

function CollectionItem({
	collection,
	index,
}: {
	collection: CollectionFragment;
	index: number;
}) {
	return (
		<Link
			className="flex gap-2"
			key={collection.id}
			to={`/collections/${collection.handle}`}
			prefetch="intent"
		>
			<span> - </span>
			{collection?.image && (
				<Image
					alt={collection.image.altText || collection.title}
					aspectRatio="1/1"
					data={collection.image}
					loading={index < 3 ? "eager" : undefined}
				/>
			)}
			<h5>{collection.title}</h5>
		</Link>
	);
}
