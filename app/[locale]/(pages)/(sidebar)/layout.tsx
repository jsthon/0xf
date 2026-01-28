import { ScrollArea } from "@/components/scroll-area";
import { SidebarNav } from "@/components/sidebar-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="container-fluid flex-1 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-16 z-30 hidden h-[calc(100vh-4rem)] w-full shrink-0 border-r md:sticky md:block">
          <ScrollArea className="h-full">
            <SidebarNav />
          </ScrollArea>
        </aside>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
