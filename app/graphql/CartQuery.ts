// https://shopify.dev/docs/api/storefront/2024-04/input-objects/CartLineInput
// TODO: Play with this until it works

import type { CartApiQueryFragment } from "storefrontapi.generated";

/**
 * cartMutateFragment requirements:
 *
 * - Must be named `CartApiMutation`
 * - Only have access to the following query variables:
 *   - $cartId: ID!
 *   - $country: CountryCode
 *   - $language: LanguageCode
 **/
export const CART_MUTATE_FRAGMENT = `#graphql
mutation cartCreate {
  cartCreate {
    cart {
      ...CartApiMutation
      checkoutUrl
    }
    userErrors {
      ...CartApiError
    }
  }
}

fragment CartApiMutation on Cart {
  id
  totalQuantity
  checkoutUrl
}

fragment CartApiError on CartUserError {
  message
  field
  code
}

`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/cart
/**
 * cartQueryFragment requirements:
 *
 * - Must be named `CartApiQuery`
 * - Only have access to the following query variables:
 *   - $cartId: ID!
 *   - $country: CountryCode
 *   - $language: LanguageCode
 *   - $numCartLines: Int
 **/
export const CART_QUERY_FRAGMENT = `#graphql
  fragment CartApiQuery on Cart {
    note
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...CartApiMoney
              }
              price {
                ...CartApiMoney
              }
              requiresShipping
              title
              image {
                ...CartApiImage
              }
              product {
                handle
                title
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...CartApiMoney
      }
      totalAmount {
        ...CartApiMoney
      }
      totalDutyAmount {
        ...CartApiMoney
      }
      totalTaxAmount {
        ...CartApiMoney
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      applicable
      code
    }
  }
  fragment CartApiMoney on MoneyV2 {
    currencyCode
    amount
  }
  fragment CartApiImage on Image {
    id
    url
    altText
    width
    height
  }
` as const;

export type CartQuery = Promise<CartApiQueryFragment | null>;
