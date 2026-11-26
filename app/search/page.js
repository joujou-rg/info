import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsCard from "@/components/NewsCard";
import { searchArticlesData } from "@/lib/queries";

async function SearchContent({ searchParams }) {
  const resolved = await searchParams;
  const q = String(resolved?.q || "").trim();
  const articles = q ? await searchArticlesData(q) : [];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
      <div className="border-b-2 border-[#fa9000] pb-3 mb-6">
        <h1 className="text-2xl font-extrabold text-zinc-900">البحث في الأخبار</h1>
      </div>

      <form action="/search" method="GET" className="flex gap-2 max-w-xl mb-8">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="اكتب كلمة للبحث في العنوان أو المحتوى..."
          className="flex-1 border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#fa9000]"
        />
        <button
          type="submit"
          className="bg-[#fa9000] hover:bg-[#d97706] text-white font-bold px-6 py-2.5 text-sm"
        >
          بحث
        </button>
      </form>

      {q && (
        <p className="text-sm text-zinc-600 mb-6">
          نتائج البحث عن: <strong className="text-zinc-900">"{q}"</strong> ({articles.length} نتيجة)
        </p>
      )}

      {q && articles.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 p-8 text-center text-zinc-600">
          لم يتم العثور على أخبار مطابقة لبحثك.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage({ searchParams }) {
  return (
    <>
      <Suspense fallback={<div className="h-28 bg-zinc-100 border-b border-zinc-200" />}>
        <SiteHeader />
      </Suspense>

      <Suspense
        fallback={
          <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
            <div className="h-64 bg-zinc-100 animate-pulse border border-zinc-200" />
          </main>
        }
      >
        <SearchContent searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<div className="h-40 bg-zinc-900" />}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
