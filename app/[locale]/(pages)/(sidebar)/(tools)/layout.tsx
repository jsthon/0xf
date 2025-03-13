export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative flex min-h-full flex-col py-6 lg:py-8">
      {children}
    </main>
  );
}
