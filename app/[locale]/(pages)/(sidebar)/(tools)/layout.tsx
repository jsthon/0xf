export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative h-full lg:gap-10 xl:grid xl:grid-cols-[1fr_280px]">
      <article className="mx-auto flex h-full w-full min-w-0 flex-col py-6 lg:py-8">
        {children}
      </article>
      <aside className="hidden text-sm xl:block">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] pt-8">
          <div className="no-scrollbar h-full overflow-auto pb-8">
            <div>Block</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
