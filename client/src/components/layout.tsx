import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Moon, Sun, Menu, X } from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/kalkulator", label: "Kalkulator" },
  { href: "/program", label: "Program" },
  { href: "/dashboard", label: "Dashboard" },
];

function ZakatKuLogo() {
  return (
    <Link href="/" data-testid="link-home-logo">
      <div className="flex items-center gap-2 cursor-pointer">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="ZakatKu Logo"
        >
          {/* Crescent moon */}
          <path
            d="M18 3C10.268 3 4 9.268 4 17s6.268 14 14 14c3.726 0 7.12-1.458 9.627-3.834A12 12 0 0 1 14 17 12 12 0 0 1 27.627 6.834 13.93 13.93 0 0 0 18 3z"
            fill="currentColor"
            className="text-primary"
          />
          {/* Star */}
          <path
            d="M28 8l1.2 2.4 2.65.39-1.92 1.87.45 2.64L28 14.04l-2.38 1.26.45-2.64-1.92-1.87 2.65-.39L28 8z"
            fill="currentColor"
            className="text-secondary"
          />
        </svg>
        <span className="text-lg font-bold tracking-tight">
          Zakat<span className="text-primary">Ku</span>
        </span>
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <ZakatKuLogo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map(link => (
                    <Link key={link.href} href={link.href}>
                      <span
                        className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                          location === link.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        onClick={() => setMobileOpen(false)}
                        data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <ZakatKuLogo />
              <p className="mt-3 text-sm text-muted-foreground">
                Platform kalkulator zakat berbasis AI dan donasi transparan untuk umat Indonesia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Navigasi</h4>
              <ul className="space-y-2">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Pembayaran</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">Powered by</span>
                <span className="font-bold text-sm text-primary">Mayar</span>
              </div>
              <PerplexityAttribution />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            © 2026 ZakatKu. Seluruh hak dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
