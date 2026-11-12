import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "INR";

  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);

  const checkout = () => {
    const url = getCheckoutUrl();
    if (url) { window.open(url, "_blank"); setOpen(false); }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button aria-label="Open cart" className="brutal brutal-press relative flex h-11 w-11 items-center justify-center bg-accent shadow-hard-sm">
          <ShoppingBag className="h-4 w-4" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center border-2 border-border bg-primary text-[0.65rem] font-bold text-primary-foreground">{totalItems}</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col border-l border-border bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-3xl font-bold uppercase">Your bag</SheetTitle>
          <SheetDescription>{totalItems === 0 ? "Your bag is empty" : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}</SheetDescription>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingBag className="h-10 w-10" strokeWidth={1} />
            <p>Nothing here yet.</p>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4">
              {items.map((item) => {
                const img = item.product.node.images.edges[0]?.node;
                return (
                  <div key={item.variantId} className="flex gap-4 border border-border bg-card p-3 shadow-hard-sm">
                    <div className="h-16 w-16 shrink-0 overflow-hidden border-2 border-border bg-stage">
                      {img && <img src={img.url} alt={item.product.node.title} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.product.node.title}</p>
                      {item.variantTitle !== "Default Title" && <p className="text-xs text-muted-foreground">{item.selectedOptions.map((o) => o.value).join(" · ")}</p>}
                      <p className="mt-1 text-sm font-bold">{formatPrice(item.price.amount, item.price.currencyCode)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button aria-label="Remove" onClick={() => removeItem(item.variantId)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      <div className="flex items-center gap-2 border-2 border-border px-2 py-1">
                        <button aria-label="Decrease" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}><Minus className="h-3 w-3" /></button>
                        <span className="w-4 text-center text-sm">{item.quantity}</span>
                        <button aria-label="Increase" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-4 border-t border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-2xl font-bold">{formatPrice(String(total), currency)}</span>
              </div>
              <Button onClick={checkout} size="lg" className="brutal brutal-press h-14 w-full rounded-none font-display text-base font-bold uppercase" disabled={isLoading || isSyncing}>
                {isLoading || isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ExternalLink className="mr-2 h-4 w-4" />Secure checkout</>}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
