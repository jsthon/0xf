export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative h-full lg:gap-10 xl:grid xl:grid-cols-[1fr_280px]">
      <article className="mx-auto flex h-full w-full max-w-3xl min-w-0 flex-col py-6 lg:py-8 xl:max-w-4xl">
        {children}
      </article>
      <aside className="hidden text-sm xl:block">
        <div className="sticky top-24 h-[calc(100vh-6rem)] pt-8">
          <div className="no-scrollbar h-full overflow-auto pb-8">
            <div>Block</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
