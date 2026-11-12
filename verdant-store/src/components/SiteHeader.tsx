import { Link } from "@tanstack/react-router";
import { CartDrawer } from "@/components/CartDrawer";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-[2.5px] border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-4xl tracking-wide">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-border bg-primary text-xl text-primary-foreground">V</span>
          Verdant
        </Link>
        <nav className="hidden gap-1 text-sm font-bold uppercase tracking-wider md:flex">
          {[["Shop", "/#shop"], ["Sound", "/#features"], ["FAQ", "/#faq"]].map(([t, h]) => (
            <a key={t} href={h} className="rounded-full border-2 border-transparent px-4 py-1.5 transition hover:border-border hover:bg-accent">{t}</a>
          ))}
        </nav>
        <CartDrawer />
      </div>
    </header>
  );
}
