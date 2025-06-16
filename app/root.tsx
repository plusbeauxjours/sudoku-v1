import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
  },
  { rel: "stylesheet", href: styles },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Cute Sudoku",
  viewport: "width=device-width,initial-scale=1",
  description:
    "Play a fun Sudoku puzzle built with Remix and Tailwind CSS. Track your time and improve your skills.",
  keywords: "sudoku, puzzle game, remix, react, tailwind",
  "og:title": "Cute Sudoku",
  "og:description": "Interactive Sudoku puzzle built with Remix and Tailwind CSS.",
});

export default function App() {
  return (
    <html lang="en" className="h-full">
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2931981606209596"
      />
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
