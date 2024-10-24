import { Link, type MetaFunction, useLoaderData } from "@remix-run/react";
import { Pagination, getPaginationVariables } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";
import { H1 } from "~/components/Default/Heading";

export const meta: MetaFunction = () => {
	return [{ title: "Hydrogen | Blogs" }];
};

export const loader = async ({
	request,
	context: { storefront },
}: LoaderFunctionArgs) => {
	// const paginationVariables = getPaginationVariables(request, {
	// 	pageBy: 10,
	// });

	const { blog } = await storefront.query(COLLECTIONS_BLOG_QUERY, {
		variables: {
			handle: "collections",
			// ...paginationVariables,
		},
	});

	return json({ blog });
};

export default function Blogs() {
	const { blog } = useLoaderData<typeof loader>();

	return (
		<div className="blogs">
			<H1>Collections</H1>
			<div>
				<div>
					{blog?.articles.nodes.map((node) => {
						return <Link to={`/collections/${node.handle}`}><div>{node.title}</div></Link>
					})}
				</div>
				{/* <Pagination connection={blog}>
					{({ nodes, isLoading, PreviousLink, NextLink }) => {
						return (
							<>
								<PreviousLink>
									{isLoading ? "Loading..." : <span>↑ Load previous</span>}
								</PreviousLink>
								{nodes.map((blog) => {
									return (
										<Link
											className="blog"
											key={blog.handle}
											prefetch="intent"
											to={`/blogs/${blog.handle}`}
										>
											<h2>{blog.title}</h2>
										</Link>
									);
								})}
								<NextLink>
									{isLoading ? "Loading..." : <span>Load more ↓</span>}
								</NextLink>
							</>
						);
					}}
				</Pagination> */}
			</div>
		</div>
	);
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const COLLECTIONS_BLOG_QUERY = `#graphql
  query CollectionBlog(
	$handle: String
  ) {
	blog(handle: $handle) {
		articles(first: 250) {
			nodes {
				id
				title
				handle
			}
		}
  	}
  }
` as const;
