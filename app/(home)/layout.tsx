'use client';

import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import SiteNavbar from "@/components/site-navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const opts = baseOptions();

  return (
    <div
      className="dark"
      data-home="true"
      style={{ ["--fd-nav-height" as any]: "56px" }}
    >
      <HomeLayout
        {...opts}
        nav={{
          ...(opts.nav ?? {}),
          component: <SiteNavbar showThemeToggle={false} />,
        }}
      >
        {children}
      </HomeLayout>
    </div>
  );
}