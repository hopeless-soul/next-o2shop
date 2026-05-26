import type { Metadata } from "next";
import { Fjalla_One, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { listCategories } from "@/lib/api/categories";

const fjallaOne = Fjalla_One({
  weight: "400",
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-secondary",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "O2Shop",
  description: "Premium streetwear and accessories",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: Awaited<ReturnType<typeof listCategories>>["data"] = [];
  try {
    const result = await listCategories({ limit: 100 });
    categories = result.data;
  } catch {
    // backend unreachable — render empty nav rather than crash
  }

  return (
    <html
      lang="en"
      className={`${fjallaOne.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
