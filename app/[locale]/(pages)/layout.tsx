import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-vaul-drawer-wrapper="">
      <div className="relative flex min-h-svh flex-col bg-background">
        <div data-wrapper="" className="border-grid flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
