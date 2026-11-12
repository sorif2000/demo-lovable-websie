import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import type { ShopifyProduct } from "@/lib/shopify";

type Variant = ShopifyProduct["node"]["variants"]["edges"][number]["node"];

export function AddToCartButton({ product, variant, className = "", label = "Add to bag" }: { product: ShopifyProduct; variant?: Variant | undefined; className?: string; label?: string }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const v = variant ?? product.node.variants.edges[0]?.node;
  const disabled = isLoading || !v || !v.availableForSale;

  return (
    <button
      disabled={disabled}
      onClick={async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!v) return;
        await addItem({ product, variantId: v.id, variantTitle: v.title, price: v.price, quantity: 1, selectedOptions: v.selectedOptions });
        toast.success("Added to bag", { description: product.node.title, position: "top-center" });
      }}
      className={`inline-flex items-center justify-center gap-2 brutal brutal-press bg-primary px-6 py-3 font-display text-sm font-bold uppercase text-primary-foreground shadow-hard-sm disabled:opacity-50 ${className}`}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : v && !v.availableForSale ? "Sold out" : label}
    </button>
  );
}
