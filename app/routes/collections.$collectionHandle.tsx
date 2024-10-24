import { type MetaFunction, useLoaderData } from "@remix-run/react";
import { Image, RichText } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [{ title: `Hydrogen | ${data?.article.title ?? ""} article` }];
};

export async function loader({ params, context }: LoaderFunctionArgs) {
	const { collectionHandle } = params;
	const blogHandle = "collections"

	if (!collectionHandle || !blogHandle) {
		throw new Response("Not found", { status: 404 });
	}

	const { blog } = await context.storefront.query(COLLECTION_QUERY, {
		variables: { blogHandle, collectionHandle },
	});

	if (!blog?.articleByHandle) {
		throw new Response(null, { status: 404 });
	}

	const article = blog.articleByHandle;

	return json({ article });
}

export default function Article() {
	const { article } = useLoaderData<typeof loader>();
	const { title, contentHtml } = article;

	return (
		<div className="article">
			<h1>
				{title}
			</h1>
			<div
				className="w-[100%]"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: <This is how it works in hydrogen>
				dangerouslySetInnerHTML={{ __html: contentHtml }}
			/>

		</div>
	);
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const COLLECTION_QUERY = `#graphql
  query collection_two(
    $collectionHandle: String!
    $blogHandle: String!
  ) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $collectionHandle) {
        title
        contentHtml
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
