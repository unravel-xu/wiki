import Link from "next/link";
import { BookIcon, LibraryBig, ExternalLink , FlaskConical, Presentation } from 'lucide-react';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

const NavLink = ({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="inline-flex items-center gap-2 text-sm text-fd-muted-foreground hover:text-fd-foreground"
  >
    <span className="h-4 w-4">{icon}</span>
    <span>{children}</span>
  </Link>
);

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: 'unravel-xu',
  repo: 'wiki',
  branch: 'main',
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'MonoWeb',
      transparentMode: "top"
    },
    links: [
      {
        type: "custom",
        children: (
          <NavLink href="/reading" icon={<BookIcon className="h-4 w-4" />}>
            Reading
          </NavLink>
        ),
      },
      {
        type: "custom",
        children: (
          <NavLink href="/docs" icon={<LibraryBig className="h-4 w-4" />}>
            Documentation
          </NavLink>
        ),
      },
      {
        type: "custom",
        children: (
          <NavLink href="/project" icon={<FlaskConical className="h-4 w-4" />}>
            Project
          </NavLink>
        ),
      },
      {
        type: "custom",
        children: (
          <NavLink href="/presentation" icon={<Presentation className="h-4 w-4" />}>
            Presentation
          </NavLink>
        ),
      },
      {
        type: 'icon',
        label: 'Visit Blog', // `aria-label`
        icon: <ExternalLink />,
        text: 'Blog',
        url: 'https://monoweb-blog.vercel.app',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
