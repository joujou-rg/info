import Link from "next/link";
import { getNavCategories, getBreakingArticles } from "@/lib/queries";
import HeaderNavClient from "@/components/HeaderNavClient";

export default async function SiteHeader() {
  const [categories, breaking] = await Promise.all([
    getNavCategories(),
    getBreakingArticles(),
  ]);

  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || "بوابة أخبار ملحقة باتنة لمحو الأمية";

  return (
    <>
      <HeaderNavClient categories={categories} schoolName={schoolName} />

      {breaking.length > 0 && (
        <div className="bg-[#0f172a] text-white border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 overflow-x-auto">
            <span className="bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 shrink-0">
              عاجل
            </span>
            <div className="flex items-center gap-6 text-sm whitespace-nowrap">
              {breaking.map((item) => (
                <Link
                  key={item._id}
                  href={`/news/${item._id}`}
                  className="hover:text-[#fa9000] transition-colors font-medium"
                >
                  • {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
