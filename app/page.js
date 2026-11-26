import { Suspense } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NewsCard from "@/components/NewsCard";
import { getHomeData } from "@/lib/queries";
import { formatArabicDate } from "@/lib/helpers";

async function HomeContent() {
  const { latestArticles, featuredArticles, categorySections } = await getHomeData();

  const heroMain = featuredArticles[0] || latestArticles[0] || null;
  const heroSide = (featuredArticles.length > 1 ? featuredArticles.slice(1, 4) : latestArticles.slice(1, 4)).filter(
    (a) => a._id !== heroMain?._id
  );
  const latestSidebar = latestArticles.slice(0, 7);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-10">
      {!heroMain ? (
        <div className="bg-zinc-50 border border-zinc-200 p-10 text-center">
          <h2 className="text-xl font-bold text-zinc-800 mb-2">لا توجد أخبار منشورة حالياً</h2>
          <p className="text-sm text-zinc-600">
            يرجى العودة لاحقاً لمتابعة أحدث الأخبار والإعلانات.
          </p>
        </div>
      ) : (
        <>
          {/* Hero Editorial Grid + Latest News Sidebar */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lead Story & Secondary Stories (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <article className="bg-white border border-zinc-200 group">
                <Link href={`/news/${heroMain._id}`} className="block overflow-hidden bg-zinc-100">
                  <img
                    src={heroMain.photos?.[0] || "/images/samples/news-1.svg"}
                    alt={heroMain.title}
                    className="w-full h-72 sm:h-96 object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  />
                </Link>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    {heroMain.category && (
                      <Link
                        href={`/category/${encodeURIComponent(heroMain.category.slug)}`}
                        className="bg-[#fa9000] text-white text-xs font-bold px-2.5 py-1"
                      >
                        {heroMain.category.name}
                      </Link>
                    )}
                    <span className="text-xs text-zinc-500">
                      {formatArabicDate(heroMain.createdAt)}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-snug mb-3 group-hover:text-[#d97706] transition-colors">
                    <Link href={`/news/${heroMain._id}`}>{heroMain.title}</Link>
                  </h1>
                  <p className="text-zinc-600 text-base leading-relaxed">
                    {heroMain.summary}
                  </p>
                </div>
              </article>

              {heroSide.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {heroSide.map((item) => (
                    <NewsCard key={item._id} article={item} compact />
                  ))}
                </div>
              )}
            </div>

            {/* Latest News Sidebar (4 cols) */}
            <aside className="lg:col-span-4 bg-zinc-50 border border-zinc-200 p-4 flex flex-col">
              <div className="flex items-center justify-between border-b-2 border-[#fa9000] pb-2 mb-4">
                <h2 className="text-lg font-extrabold text-zinc-900">آخر الأخبار</h2>
                <span className="text-xs font-bold text-[#d97706]">مباشر</span>
              </div>

              <div className="divide-y divide-zinc-200 flex-1">
                {latestSidebar.map((item) => (
                  <article key={item._id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                      <span className="font-bold text-[#d97706]">
                        {item.category?.name || "أخبار"}
                      </span>
                      <span>{formatArabicDate(item.createdAt)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 leading-snug hover:text-[#d97706] transition-colors">
                      <Link href={`/news/${item._id}`}>{item.title}</Link>
                    </h3>
                  </article>
                ))}
              </div>
            </aside>
          </section>

          {/* Dynamic Category Sections */}
          {categorySections.map(({ category, articles }) => (
            <section key={category._id} className="pt-2">
              <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#fa9000] inline-block" />
                  <h2 className="text-xl font-extrabold text-zinc-900">{category.name}</h2>
                </div>
                <Link
                  href={`/category/${encodeURIComponent(category.slug)}`}
                  className="text-xs font-bold text-[#d97706] hover:underline"
                >
                  المزيد من {category.name} ←
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {articles.map((article) => (
                  <NewsCard key={article._id} article={article} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </main>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="h-28 bg-zinc-100 border-b border-zinc-200" />}>
        <SiteHeader />
      </Suspense>

      <Suspense
        fallback={
          <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
            <div className="h-96 bg-zinc-100 animate-pulse border border-zinc-200" />
          </main>
        }
      >
        <HomeContent />
      </Suspense>

      <Suspense fallback={<div className="h-40 bg-zinc-900" />}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
