import { AsideBlock } from "@/components/aside-block";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative xl:grid xl:grid-cols-[1fr_280px] xl:gap-10">
      <article className="mx-auto flex w-full max-w-3xl min-w-0 flex-col py-6 lg:py-8 xl:max-w-4xl">
        {children}
      </article>
      <aside className="hidden text-sm xl:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)] pt-8">
          <div className="no-scrollbar h-full overflow-auto pb-8">
            <AsideBlock className="mt-6 max-w-[90%]" />
          </div>
        </div>
      </aside>
    </div>
  );
}
