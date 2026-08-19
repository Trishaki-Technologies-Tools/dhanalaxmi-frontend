import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site/site-header";
import { SiteFooter } from "../components/site/site-footer";
import { MobileDock } from "../components/site/mobile-dock";
import { Toaster } from "../components/ui/sonner";
import { CartProvider } from "../lib/cart";
import { AuthProvider } from "../lib/auth";
import { OrdersProvider } from "../lib/orders";
import { ProfileProvider } from "../lib/profile";
import { AdminProvider } from "../lib/admin";
import { hydrateCatalog } from "../lib/catalog-store";
import { CartDrawer } from "../components/site/cart-drawer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-maroon-deep"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-maroon/30 bg-background px-4 py-2 text-sm font-medium text-maroon transition-colors hover:bg-maroon-soft"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dhanalaxmi Jeweler's — Hallmarked 925 Silver Jewelry" },
      {
        name: "description",
        content:
          "Luxury hallmarked 925 sterling silver jewelry — rings, chains, pendants and temple idols, hand-finished by three generations of silversmiths.",
      },
      { name: "author", content: "Dhanalaxmi Jeweler's" },
      { property: "og:title", content: "Dhanalaxmi Jeweler's — Hallmarked 925 Silver Jewelry" },
      {
        property: "og:description",
        content: "Hand-finished sterling silver heirlooms, certified and insured.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminPage = pathname.startsWith("/admin");
  const bare = isAuthPage || isAdminPage;

  useEffect(() => {
    hydrateCatalog();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <AdminProvider>
      <ProfileProvider>
      <OrdersProvider>
      <CartProvider>
        {!isAdminPage && <SiteHeader />}
        <main className={bare ? "" : "pb-20 md:pb-0"}>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        {!bare && <SiteFooter />}
        {!bare && <MobileDock />}
        <CartDrawer />
        <Toaster />
      </CartProvider>
      </OrdersProvider>
      </ProfileProvider>
      </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
