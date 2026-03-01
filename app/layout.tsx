import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "GenTask",
  description: "Gestão de tarefas colaborativas"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} font-[family-name:var(--font-ibm-plex-sans)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
