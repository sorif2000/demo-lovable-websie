import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { fetchProduct, formatPrice } from "@/lib/shopify";

const productQuery = (handle: string) => queryOptions({ queryKey: ["product", handle], queryFn: () => fetchProduct(handle) });

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQuery(params.handle));
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.node.title} — Verdant` : "Product — Verdant";
    const d = loaderData?.node.description.slice(0, 155) || "Shop premium wireless audio at Verdant.";
    const img = loaderData?.node.images.edges[0]?.node.url;
    return {
      meta: [
        { title: t }, { name: "description", content: d },
        { property: "og:title", content: t }, { property: "og:description", content: d },
        { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="text-5xl uppercase">Product not found</h1>
      <Link to="/" className="mt-8 inline-block text-primary">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(handle));
  const p = data!;
  const images = p.node.images.edges.map((e) => e.node);
  const variants = p.node.variants.edges.map((e) => e.node);
  const [active, setActive] = useState(0);
  const [vi, setVi] = useState(0);
  const v = variants[vi];

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to shop</Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div>
          <div className="brutal aspect-square overflow-hidden bg-background p-10 shadow-hard-lg">
            {images[active] && <img src={images[active].url} alt={images[active].altText ?? p.node.title} className="h-full w-full object-contain" />}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button key={img.url} onClick={() => setActive(i)} className={`h-20 w-20 overflow-hidden border bg-background p-2 ${i === active ? "border-border bg-accent" : "border-border/30"}`}>
                  <img src={img.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:pt-8">
          <h1 className="text-5xl uppercase leading-none md:text-7xl">{p.node.title}</h1>
          {v && <p className="mt-6 inline-block border border-border bg-accent px-4 py-1 font-display text-4xl font-bold shadow-hard-sm">{formatPrice(v.price.amount, v.price.currencyCode)}</p>}
          <p className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">{p.node.description}</p>
          {variants.length > 1 && (
            <div className="mt-8">
              <p className="eyebrow">Options</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {variants.map((x, i) => (
                  <button key={x.id} onClick={() => setVi(i)} disabled={!x.availableForSale} className={`border border-border px-4 py-2 font-display text-sm font-bold disabled:opacity-40 ${i === vi ? "bg-primary shadow-hard-sm" : "bg-background"}`}>{x.title}</button>
                ))}
              </div>
            </div>
          )}
          <AddToCartButton product={p} variant={v} className="mt-10 w-full py-4 text-base sm:w-auto sm:px-12" />
          <p className="mt-6 text-sm text-muted-foreground">Free shipping · Secure Shopify checkout · 7-day returns</p>
        </div>
      </div>
    </main>
  );
}
