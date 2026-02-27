import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

// export default function Layout({ children }: LayoutProps<'/'>) {
//   return (
//     <html lang="en" className={inter.className} suppressHydrationWarning>
//       <body className="flex flex-col min-h-screen">
//         <RootProvider>{children}</RootProvider>
//       </body>
//     </html>
//   );
// }

// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-fd-background text-fd-foreground overscroll-y-none">
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}