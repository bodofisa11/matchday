import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "MatchDay",
  description: "Live scores, standings and fixtures for Football, F1 and Cricket",
  icons: {
    icon: "assets/whistle.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sp-theme');if(t==='light'){document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} ${bebasNeue.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
