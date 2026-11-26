import Link from "next/link";
import { Mail } from "lucide-react";
import { getNavCategories } from "@/lib/queries";

function FacebookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export default async function SiteFooter() {
  const categories = await getNavCategories();
  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || "بوابة أخبار ملحقة باتنة لمحو الأمية";

  return (
    <footer className="bg-zinc-900 text-zinc-300 mt-auto border-t-4 border-[#fa9000]">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/logo.png"
              alt={schoolName}
              className="w-10 h-10 object-contain shrink-0 bg-white p-0.5"
            />
            <h3 className="text-lg font-extrabold text-white">{schoolName}</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            منصة إخبارية رسمية مخصصة لمتابعة مستجدات ملحقة باتنة لمحو الأمية، أخبار المتمدرسين
            والمنسقين، البلاغات الإدارية، والأنشطة التربوية والوطنية.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-3 border-b border-zinc-800 pb-2">
            أقسام الموقع
          </h4>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li>
              <Link href="/" className="hover:text-[#fa9000] transition-colors">
                الرئيسية
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/category/${encodeURIComponent(cat.slug)}`}
                  className="hover:text-[#fa9000] transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-3 border-b border-zinc-800 pb-2">
            تواصل معنا
          </h4>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            <li>
              <a
                href="mailto:mulhaqetbatna0505@gmail.com"
                className="flex items-center gap-2 hover:text-[#fa9000] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#fa9000] shrink-0" />
                <span dir="ltr">mulhaqetbatna0505@gmail.com</span>
              </a>
            </li>
            <li>
              <a
                href="https://web.facebook.com/pageonaeabatna"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#fa9000] transition-colors"
              >
                <FacebookIcon className="w-4 h-4 text-[#fa9000] shrink-0" />
                <span>صفحة الفيسبوك الرسمية</span>
              </a>
            </li>
            <li className="pt-2 border-t border-zinc-800 flex items-center gap-4 text-xs">
              <Link href="/search" className="hover:text-[#fa9000] transition-colors">
                البحث في الأرشيف
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-zinc-950 py-4 text-center text-xs text-zinc-500 border-t border-zinc-800">
        جميع الحقوق محفوظة © {new Date().getFullYear()} — {schoolName}
      </div>
    </footer>
  );
}
