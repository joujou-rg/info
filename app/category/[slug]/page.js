import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsCard from "@/components/NewsCard";
import { getCategoryPageData } from "@/lib/queries";

async function CategoryContent({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const page = Math.max(Number(resolvedSearch?.page) || 1, 1);

  const data = await getCategoryPageData(slug, page, 12);
  if (!data) {
    notFound();
  }

  const { category, articles, total, totalPages } = data;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
      <div className="border-b-2 border-[#fa9000] pb-3 mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-500 mb-1">
            <Link href="/" className="hover:text-[#d97706]">
              الرئيسية
            </Link>{" "}
            / <span>{category.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            {category.name}
          </h1>
        </div>
        <span className="text-xs font-bold bg-zinc-100 border border-zinc-200 px-3 py-1.5 text-zinc-700">
          {total} خبر
        </span>
      </div>

      {articles.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 p-10 text-center text-zinc-600">
          لا توجد أخبار منشورة في هذا القسم حالياً.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article._id} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <Link
                  key={p}
                  href={`/category/${encodeURIComponent(category.slug)}?page=${p}`}
                  className={`px-3.5 py-2 text-sm font-bold border ${
                    p === page
                      ? "bg-[#fa9000] text-white border-[#fa9000]"
                      : "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function CategoryPage({ params, searchParams }) {
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
        <CategoryContent params={params} searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<div className="h-40 bg-zinc-900" />}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
