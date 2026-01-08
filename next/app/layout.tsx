import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aicommandlab.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Command Lab | Multi-Brand Automation Platform",
    template: "%s | AI Command Lab",
  },
  description:
    "Central dashboard for multi-brand automation. Powering SOTSVC.com, TrustedCleaningExpert.com, DLD-Online.com, and BossOfClean.com.",
  keywords: [
    "automation",
    "multi-brand",
    "cleaning services",
    "SOTSVC",
    "Trusted Cleaning Expert",
    "DLD Online",
    "Boss of Clean",
  ],
  authors: [{ name: "AI Command Lab" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "AI Command Lab",
    title: "AI Command Lab | Multi-Brand Automation Platform",
    description:
      "Central dashboard for multi-brand automation. Powering SOTSVC.com, TrustedCleaningExpert.com, DLD-Online.com, and BossOfClean.com.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Command Lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Command Lab | Multi-Brand Automation Platform",
    description:
      "Central dashboard for multi-brand automation. Powering SOTSVC.com, TrustedCleaningExpert.com, DLD-Online.com, and BossOfClean.com.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="p-4 border-b">
          <h1 className="text-xl font-bold">AI Command Lab</h1>
        </header>
        <main className="p-6">{children}</main>
        <footer className="p-4 border-t text-sm text-center">
          © {new Date().getFullYear()} AI Command Lab
        </footer>
      </body>
    </html>
  );
}
