import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Layers, Image as ImageIcon, MessageSquare, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/admin/cms")({
  component: CmsLayout,
});

function CmsLayout() {
  const tabs = [
    { label: "Hero Slides", to: "/admin/cms/hero", icon: ImageIcon },
    { label: "Testimonials", to: "/admin/cms/testimonials", icon: MessageSquare },
    { label: "FAQs", to: "/admin/cms/faqs", icon: HelpCircle },
    { label: "Pages", to: "/admin/cms/pages", icon: Layers },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
        <p className="text-muted-foreground">Manage the public website content.</p>
      </div>

      <div className="flex space-x-1 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className="flex items-center gap-2 px-4 py-2 border-b-2 border-transparent text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:border-primary [&.active]:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
