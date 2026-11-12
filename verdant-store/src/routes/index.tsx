import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BatteryFull, Headphones, Droplets, Bluetooth, Truck, ShieldCheck, RotateCcw, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AddToCartButton } from "@/components/AddToCartButton";
import { fetchProducts, formatPrice } from "@/lib/shopify";
import heroImg from "@/assets/earbuds-green.jpg";
import blackImg from "@/assets/earbuds-black.jpg";
import whiteImg from "@/assets/earbuds-white.jpg";
import { useReveal } from "@/hooks/useReveal";

const productsQuery = queryOptions({ queryKey: ["products"], queryFn: () => fetchProducts(24) });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verdant — Wireless Earbuds That Turn It Up" },
      { name: "description", content: "Verdant true wireless earbuds: noise cancelling, all-day battery and instant pairing in three bold colorways. Free shipping." },
      { property: "og:title", content: "Verdant — Wireless Earbuds That Turn It Up" },
      { property: "og:description", content: "Noise cancelling, all-day battery, three bold colorways. Free shipping." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Home,
});

const DEMO = [
  { img: heroImg, t: "Verdant Pro ANC", d: "Noise cancelling in a forest-green finish.", p: "₹2,999", tag: "Bestseller", bg: "bg-accent" },
  { img: blackImg, t: "Verdant Volt", d: "Punchy bass, black with orange accents.", p: "₹2,499", tag: "Bass boost", bg: "bg-primary" },
  { img: whiteImg, t: "Verdant Air", d: "Featherlight everyday earbuds in white.", p: "₹1,999", tag: "Lightest", bg: "bg-muted" },
];

const FEATURES = [
  { icon: Headphones, t: "Noise cancelling", d: "Fade out the commute and focus on your music.", bg: "bg-primary text-primary-foreground" },
  { icon: BatteryFull, t: "All-day battery", d: "Hours of playback plus extra charges in the case.", bg: "bg-accent" },
  { icon: Bluetooth, t: "Instant pairing", d: "Open the lid and you're connected.", bg: "bg-secondary text-secondary-foreground" },
  { icon: Droplets, t: "Sweat resistant", d: "Built for workouts, rain and everything between.", bg: "bg-card" },
];

const FAQ = [
  ["How long does delivery take?", "Orders usually arrive within 5–10 business days. You'll receive tracking by email."],
  ["Can I return my order?", "Yes. If you're not happy, contact us within 7 days of delivery for a return."],
  ["Is checkout secure?", "Payments are handled by Shopify's secure checkout. We never see or store your card details."],
  ["Do they work with iPhone and Android?", "Yes, they pair with any Bluetooth phone, tablet or laptop."],
];

const TICKER = ["Turn it up", "Free shipping", "All-day battery", "Secure checkout", "7-day returns", "Instant pairing"];

function Home() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const featured = products[0];
  useReveal(products.length);

  return (
    <main className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden bg-dots">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-2 lg:pt-20">
          <div className="animate-rise">
            <span className="eyebrow">★ New drop · True wireless</span>
            <h1 className="mt-6 font-display text-[5.5rem] leading-[0.85] sm:text-[8rem] lg:text-[9.5rem]">
              Turn<br /><span className="text-retro">it up.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg font-medium text-muted-foreground">
              Noise cancelling earbuds with all-day battery and instant pairing, in three colorways that refuse to be boring.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              {featured ? (
                <>
                  <AddToCartButton product={featured} label="Add to bag" className="px-8 py-4 text-base" />
                  <span className="font-display text-5xl">{formatPrice(featured.node.priceRange.minVariantPrice.amount, featured.node.priceRange.minVariantPrice.currencyCode)}</span>
                </>
              ) : (
                <a href="#shop" className="brutal brutal-press rounded-full bg-primary px-8 py-4 text-lg font-bold uppercase tracking-wider text-primary-foreground">Shop the lineup →</a>
              )}
              <div className="flex items-center gap-1 text-sm font-semibold">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-accent text-foreground" />)}
                <span className="ml-1">Loved by early listeners</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="sunburst absolute aspect-square w-[115%] max-w-[640px]" />
            <div className="relative w-full max-w-sm animate-float">
              <div className="brutal overflow-hidden rounded-[2rem] shadow-hard-lg">
                <img src={heroImg} alt="Green wireless earbuds in charging case" width={1024} height={1024} className="w-full object-cover" />
              </div>
              <span className="absolute -right-6 -top-6 flex h-28 w-28 animate-wobble items-center justify-center rounded-full border-[2.5px] border-border bg-primary text-center font-display text-2xl leading-none text-primary-foreground shadow-hard">ANC<br />Pro</span>
              <span className="brutal absolute -bottom-5 -left-6 rotate-[-6deg] rounded-full bg-accent px-5 py-2 text-sm font-bold uppercase tracking-wider">30h battery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="-rotate-1 scale-105 border-y-[2.5px] border-border bg-secondary py-4 text-secondary-foreground">
        <div className="flex w-max animate-marquee gap-10 font-display text-3xl tracking-wide">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-10">{t}<span className="text-accent">★</span></span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="reveal text-center">
          <span className="eyebrow">The good stuff</span>
          <h2 className="mt-5 font-display text-6xl md:text-8xl">Big sound. Tiny buds.</h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, t, d, bg }, i) => (
            <div key={t} className={`reveal brutal brutal-press ${bg} p-7`} style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-[2.5px] border-border bg-card text-foreground"><Icon className="h-6 w-6" /></span>
              <h3 className="mt-8 font-display text-4xl">{t}</h3>
              <p className="mt-2 font-medium opacity-80">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="relative bg-stage pb-24">
        <div className="wavy rotate-180" />
        <div className="mx-auto max-w-7xl px-6 pt-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="reveal">
              <span className="eyebrow">Shop</span>
              <h2 className="mt-5 font-display text-6xl md:text-8xl">Pick your flavor</h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <span className="flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5"><Truck className="h-4 w-4" />Free shipping</span>
              <span className="flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5"><ShieldCheck className="h-4 w-4" />Secure</span>
              <span className="flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5"><RotateCcw className="h-4 w-4" />Returns</span>
            </div>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.length === 0
              ? DEMO.map((d, i) => (
                  <div key={d.t} className="reveal brutal brutal-press group flex flex-col overflow-hidden" style={{ transitionDelay: `${i * 120}ms` }}>
                    <div className={`relative aspect-square overflow-hidden border-b-[2.5px] border-border ${d.bg}`}>
                      <img src={d.img} alt={`${d.t} earbuds`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110 group-hover:rotate-2" />
                      <span className="absolute left-4 top-4 rounded-full border-2 border-border bg-card px-3 py-1 text-xs font-bold uppercase tracking-wider">{d.tag}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-4xl">{d.t}</h3>
                      <p className="mt-1 font-medium text-muted-foreground">{d.d}</p>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="font-display text-4xl text-primary">{d.p}</span>
                        <span className="rounded-full border-2 border-dashed border-border px-4 py-2 text-xs font-bold uppercase tracking-wider">Coming soon</span>
                      </div>
                    </div>
                  </div>
                ))
              : products.map((p) => {
                  const img = p.node.images.edges[0]?.node;
                  const price = p.node.priceRange.minVariantPrice;
                  return (
                    <Link key={p.node.id} to="/product/$handle" params={{ handle: p.node.handle }} className="reveal brutal brutal-press group flex flex-col overflow-hidden">
                      <div className="aspect-square overflow-hidden border-b-[2.5px] border-border bg-muted p-8">
                        {img && <img src={img.url} alt={img.altText ?? p.node.title} loading="lazy" className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display text-4xl">{p.node.title}</h3>
                        <p className="mt-1 line-clamp-2 text-muted-foreground">{p.node.description}</p>
                        <div className="mt-6 flex items-center justify-between">
                          <span className="font-display text-4xl text-primary">{formatPrice(price.amount, price.currencyCode)}</span>
                          <AddToCartButton product={p} className="px-4 py-2" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="reveal brutal relative overflow-hidden bg-primary px-8 py-16 text-center text-primary-foreground md:py-24">
          <div className="sunburst absolute left-1/2 top-1/2 aspect-square w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
          <h2 className="relative font-display text-6xl md:text-9xl">Life's too loud.</h2>
          <p className="relative mx-auto mt-4 max-w-md text-lg font-medium">Silence the noise, keep the music. Free shipping on every order.</p>
          <a href="#shop" className="brutal brutal-press relative mt-8 inline-block rounded-full bg-accent px-8 py-4 text-lg font-bold uppercase tracking-wider text-accent-foreground">Get yours →</a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 lg:grid-cols-[1fr_1.5fr]">
        <div className="reveal">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-5 font-display text-6xl md:text-8xl">Got questions?</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-4">
          {FAQ.map(([q, a]) => (
            <AccordionItem key={q} value={q ?? ""} className="brutal px-5">
              <AccordionTrigger className="font-sans text-lg font-bold tracking-normal hover:no-underline">{q}</AccordionTrigger>
              <AccordionContent className="font-medium text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}
