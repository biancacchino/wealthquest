import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pocket Paths",
  description: "A calm, Pokémon-style financial literacy adventure."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
