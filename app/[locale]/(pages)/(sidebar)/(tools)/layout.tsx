export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative h-full py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
      <article className="mx-auto flex h-full w-full max-w-3xl min-w-0 flex-col">
        {children}
      </article>
      <aside className="hidden text-sm xl:block">
        <div className="sticky top-20 -mt-6 h-[calc(100vh-3.5rem)] pt-4">
          <div className="no-scrollbar h-full overflow-auto pb-10">
            <div>Block</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
