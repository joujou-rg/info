import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata = {
  title: process.env.NEXT_PUBLIC_SCHOOL_NAME || "بوابة أخبار ملحقة باتنة لمحو الأمية",
  description:
    "الموقع الإخباري الرسمي لملحقة باتنة لمحو الأمية - أخبار المتمدرسين، المنسقين، الوثائق العامة، والأنشطة الوطنية.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
