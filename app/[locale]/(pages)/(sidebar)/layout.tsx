import { ScrollArea } from "@/components/scroll-area";
import { SidebarNav } from "@/components/sidebar-nav";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 px-4 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:px-6">
      <aside className="fixed top-24 z-30 hidden h-[calc(100vh-6rem)] w-full shrink-0 border-r md:sticky md:block">
        <ScrollArea className="h-full">
          <SidebarNav />
        </ScrollArea>
      </aside>
      {children}
    </div>
  );
}
