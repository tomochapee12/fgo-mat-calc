import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  onHome: () => void;
  onResetAll: () => void;
}

export function Layout({ children, onHome, onResetAll }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <Header onHome={onHome} onResetAll={onResetAll} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
