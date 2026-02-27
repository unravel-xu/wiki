// import { HomeLayout } from 'fumadocs-ui/layouts/home';
// import { baseOptions } from '@/lib/layout.shared';

// export default function Layout({ children }: LayoutProps<'/'>) {
//   return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
// }
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import HomeNavbar from "./home-navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const opts = baseOptions();

  return (
    <div
      className="dark"
      style={{
        colorScheme: "dark",
        // 你的 navbar 高度（下面 HomeNavbar 用 h-14 = 56px）
        ["--fd-nav-height" as any]: "56px",
      }}
    >
      <HomeLayout
        {...opts}
        nav={{
          ...(opts.nav ?? {}),
          component: <HomeNavbar />,
        }}
      >
        {children}
      </HomeLayout>
    </div>
  );
}