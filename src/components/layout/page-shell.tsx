import { Navbar } from "@/components/layout/navbar";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";

export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">{description}</p>
          {children ?? (
            <p className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              This page is coming next. Content will be managed from the admin panel.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
