import SiteNavbar from "@/components/site-navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ ["--fd-nav-height" as any]: "56px" }}>
      <SiteNavbar showThemeToggle />
      <main>{children}</main>
    </div>
  );
}