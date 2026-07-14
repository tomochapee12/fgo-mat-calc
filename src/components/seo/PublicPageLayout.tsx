import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Footer } from '@/components/layout/Footer';

interface PublicPageLayoutProps {
  children: ReactNode;
}

const links = [
  { href: '/servants/', label: 'サーヴァント' },
  { href: '/materials/', label: '素材' },
  { href: '/class-score/', label: 'クラススコア' },
  { href: '/guide/usage/', label: '使い方' },
  { href: '/updates/', label: '更新情報' },
];

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-gray-100">
      <header className="border-b border-gray-700 bg-gray-900 px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3">
          <Link className="text-lg font-bold text-white hover:text-yellow-300" to="/">
            FGO素材シミュレーター
          </Link>
          <nav aria-label="公開データページ" className="flex flex-wrap gap-4 text-sm text-gray-300">
            {links.map((link) => (
              <Link key={link.href} className="hover:text-yellow-300" to={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="パンくず" className="mb-6 text-sm text-gray-400">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link className="hover:text-yellow-300" to="/">トップ</Link></li>
        {items.map((item) => (
          <li key={`${item.href ?? ''}-${item.label}`} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {item.href ? <Link className="hover:text-yellow-300" to={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
