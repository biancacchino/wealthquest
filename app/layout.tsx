import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wealth Quest — Ellehacks 2026",
  description: "A high-fidelity retro Pokémon-style authentication system."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
         <script src="https://cdn.tailwindcss.com"></script>
         <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
         <script dangerouslySetInnerHTML={{ __html: `
           window.addEventListener('keydown', function(e) {
             if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
               e.preventDefault();
             }
           }, { passive: false });
         `}} />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
