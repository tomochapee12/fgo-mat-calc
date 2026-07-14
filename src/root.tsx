import type { ReactNode } from 'react';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';
import './index.css';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#111827" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-900 text-gray-100">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="grid min-h-screen place-items-center bg-gray-900 px-4 text-center text-gray-200">
      <div className="max-w-lg space-y-4">
        <title>{notFound ? 'ページが見つかりません' : 'エラーが発生しました'}｜FGO素材シミュレーター</title>
        <meta name="robots" content="noindex" />
        <h1 className="text-2xl font-bold text-white">
          {notFound ? 'ページが見つかりません' : 'エラーが発生しました'}
        </h1>
        <p className="text-gray-400">
          {notFound ? 'URLが変更されたか、ページが削除された可能性があります。' : '時間をおいてもう一度お試しください。'}
        </p>
        <a className="inline-block rounded bg-yellow-400 px-4 py-3 font-bold text-gray-900" href="/">
          FGO素材シミュレーターへ戻る
        </a>
      </div>
    </main>
  );
}
