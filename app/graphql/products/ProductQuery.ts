import { PRODUCT_VARIANT_FRAGMENT } from "./ProductVariantQuery";

export const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }

  fragment ProductItem on Product {
	id
	handle
	title
	featuredImage {
		id
		altText
		url
		width
		height
		
	  }
	images (first: 15){
		nodes {
		  id
		  altText
		  url
		  width
		  height
		}
	}
	priceRange {
	  minVariantPrice {
		...MoneyProductItem
	  }
	  maxVariantPrice {
		...MoneyProductItem
	  }
	}
	variants(first: 1) {
	  nodes {
		selectedOptions {
		  name
		  value
		}
	  }
	}
  }
` as const;

export const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    images (first: 15){
		nodes {
		  id
		  altText
		  url
		  width
		  height
		}
	}
    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

export const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
