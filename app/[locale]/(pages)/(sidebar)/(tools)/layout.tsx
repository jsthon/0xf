import { AsideBlock } from "@/components/aside-block";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid flex-1 xl:grid-cols-[1fr_280px] xl:gap-10">
      <article className="mx-auto flex min-h-0 w-full max-w-3xl min-w-0 flex-col pt-6 pb-8 lg:pt-8 lg:pb-12 xl:max-w-4xl group-has-data-[state=collapsed]/sidebar-wrapper:xl:max-w-7xl">
        {children}
      </article>
      <aside className="hidden text-sm xl:block">
        <div className="sticky top-[65px] h-[calc(100vh-65px)] pt-8">
          <div className="no-scrollbar h-full overflow-auto pb-8">
            <div className="mt-6 flex flex-col gap-4">
              <AsideBlock className="max-w-[90%]" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
