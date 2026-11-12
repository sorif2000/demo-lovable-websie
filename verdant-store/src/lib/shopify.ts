import { toast } from "sonner";

export const SHOPIFY_API_VERSION = "2026-10";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "modern-grooming-essentials-qibmm-exdzyaxk.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
// Storefront tokens are public by design (read-only, client-side).
export const SHOPIFY_STOREFRONT_TOKEN = "21bd2af92e34f64c9aec66420b42299a";

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

const PRODUCT_FIELDS = `
  id title description handle
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 5) { edges { node { url altText } } }
  variants(first: 10) { edges { node { id title price { amount currencyCode } availableForSale selectedOptions { name value } } } }
  options { name values }
`;

export const PRODUCTS_QUERY = `query GetProducts($first: Int!, $query: String) { products(first: $first, query: $query) { edges { node { ${PRODUCT_FIELDS} } } } }`;
export const PRODUCT_BY_HANDLE_QUERY = `query GetProduct($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 402) {
    if (typeof window !== "undefined") {
      toast.error("Shopify: Payment required", {
        description: "Shopify API access requires an active Shopify billing plan. Visit https://admin.shopify.com to upgrade.",
      });
    }
    return;
  }
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
  return data;
}

export async function fetchProducts(first = 20): Promise<ShopifyProduct[]> {
  try {
    const data = await storefrontApiRequest(PRODUCTS_QUERY, { first });
    return data?.data?.products?.edges ?? [];
  } catch (e) {
    console.error("Could not load products:", e);
    return [];
  }
}

export async function fetchProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  const p = data?.data?.product;
  return p ? { node: p } : null;
}

export const formatPrice = (amount: string, currency: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(parseFloat(amount));

// ---------- Cart ----------
export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

export const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
const LINES = `lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }`;
const CART_CREATE_MUTATION = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl ${LINES} } userErrors { field message } } }`;
const CART_LINES_ADD_MUTATION = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id ${LINES} } userErrors { field message } } }`;
const CART_LINES_UPDATE_MUTATION = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } } }`;
const CART_LINES_REMOVE_MUTATION = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } } }`;

type UserError = { field: string[] | null; message: string };

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

const isCartNotFoundError = (errs: UserError[]) =>
  errs.some((e) => e.message.toLowerCase().includes("cart not found") || e.message.toLowerCase().includes("does not exist"));

export async function createShopifyCart(item: CartItem) {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, { input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] } });
  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error("Cart creation failed:", data.data.cartCreate.userErrors);
    return null;
  }
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;
  return { cartId: cart.id as string, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId: lineId as string };
}

export async function addLineToShopifyCart(cartId: string, item: CartItem): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, { cartId, lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] });
  const errs: UserError[] = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(errs)) return { success: false, cartNotFound: true };
  if (errs.length > 0) { console.error("Add line failed:", errs); return { success: false }; }
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, { cartId, lines: [{ id: lineId, quantity }] });
  const errs: UserError[] = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(errs)) return { success: false, cartNotFound: true };
  if (errs.length > 0) { console.error("Update line failed:", errs); return { success: false }; }
  return { success: true };
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });
  const errs: UserError[] = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(errs)) return { success: false, cartNotFound: true };
  if (errs.length > 0) { console.error("Remove line failed:", errs); return { success: false }; }
  return { success: true };
}
