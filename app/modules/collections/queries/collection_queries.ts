export const GET_COLLECTIONS_QUERY = `#graphql
  query BlogPosts {
    blog(handle: "collections") {
      articles(first: 100) {
        nodes {
          id
          title
        }
      }
    }
  }
` as const
export const GET_COLLECTION_QUERY = `#graphql
    query Collections($endCursor: String
    $first: Int
    $last: Int
    $startCursor: String
    $id: String
  ) @inContext(id: $id) {
    article(id: $id) {
        id
        contentHtml
    }

` as const