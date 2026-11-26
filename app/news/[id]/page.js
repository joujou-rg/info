import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getArticlePageData } from "@/lib/queries";
import { formatArabicDateTime } from "@/lib/helpers";

async function ArticleContent({ params }) {
  const { id } = await params;
  const data = await getArticlePageData(id);

  if (!data) {
    notFound();
  }

  const { article, relatedArticles } = data;
  const mainPhoto = article.photos?.[0] || "/images/samples/news-1.svg";
  const galleryPhotos = article.photos?.slice(1) || [];
  const facebookUrl = article.videoUrl?.trim() || "";

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
      {/* Breadcrumb */}
      <div className="text-xs text-zinc-500 mb-4 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-[#d97706]">
          الرئيسية
        </Link>
        <span>/</span>
        {article.category && (
          <>
            <Link
              href={`/category/${encodeURIComponent(article.category.slug)}`}
              className="hover:text-[#d97706] font-bold text-[#d97706]"
            >
              {article.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-zinc-700 truncate max-w-md">{article.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Article Column */}
        <article className="lg:col-span-8 bg-white border border-zinc-200 p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            {article.category && (
              <Link
                href={`/category/${encodeURIComponent(article.category.slug)}`}
                className="bg-[#fa9000] text-white text-xs font-bold px-3 py-1"
              >
                {article.category.name}
              </Link>
            )}
            {article.isBreaking && (
              <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1">
                عاجل
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 leading-snug mb-4">
            {article.title}
          </h1>

          <p className="text-lg text-zinc-700 font-medium leading-relaxed mb-5 border-r-4 border-[#fa9000] pr-4">
            {article.summary}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 border-y border-zinc-200 py-3 mb-6">
            <span>
              المصدر: <strong className="text-zinc-800">{article.author}</strong>
            </span>
            <span>نُشر في: {formatArabicDateTime(article.createdAt)}</span>
          </div>

          {/* Cover Photo */}
          <figure className="mb-6 bg-zinc-100 border border-zinc-200">
            <img
              src={mainPhoto}
              alt={article.title}
              className="w-full max-h-[500px] object-cover"
            />
          </figure>

          {/* Facebook Link if provided */}
          {facebookUrl && (
            <div className="mb-6 border border-zinc-200 bg-zinc-50 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-[#1877f2] shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                <div>
                  <div className="text-sm font-bold text-zinc-900">
                    رابط فيسبوك مرفق بالخبر
                  </div>
                  <div className="text-xs text-zinc-500">
                    اضغط لفتح المنشور أو الفيديو على فيسبوك
                  </div>
                </div>
              </div>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold px-4 py-2.5 transition-colors"
              >
                مشاهدة على فيسبوك
              </a>
            </div>
          )}

          {/* Full Article Content */}
          <div className="space-y-4 text-zinc-800 text-base sm:text-lg leading-loose">
            {article.content
              .split(/\n+/)
              .filter(Boolean)
              .map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
          </div>

          {/* Additional Photos Gallery */}
          {galleryPhotos.length > 0 && (
            <section className="mt-10 pt-6 border-t border-zinc-200">
              <h2 className="text-lg font-extrabold text-zinc-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-5 bg-[#fa9000] inline-block" />
                صور إضافية من الخبر
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {galleryPhotos.map((photo, idx) => (
                  <a
                    key={idx}
                    href={photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-zinc-200 bg-zinc-50 overflow-hidden"
                  >
                    <img
                      src={photo}
                      alt={`${article.title} - صورة ${idx + 2}`}
                      className="w-full h-56 object-cover hover:scale-[1.02] transition-transform"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Related News Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-50 border border-zinc-200 p-5">
            <h2 className="text-lg font-extrabold text-zinc-900 border-b-2 border-[#fa9000] pb-2 mb-4">
              أخبار ذات صلة
            </h2>

            {relatedArticles.length === 0 ? (
              <p className="text-sm text-zinc-500">لا توجد أخبار أخرى في هذا القسم حالياً.</p>
            ) : (
              <div className="divide-y divide-zinc-200">
                {relatedArticles.map((rel) => (
                  <article key={rel._id} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                    <Link href={`/news/${rel._id}`} className="shrink-0">
                      <img
                        src={rel.photos?.[0] || "/images/samples/news-1.svg"}
                        alt={rel.title}
                        className="w-20 h-16 object-cover border border-zinc-200"
                      />
                    </Link>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 leading-snug hover:text-[#d97706]">
                        <Link href={`/news/${rel._id}`}>{rel.title}</Link>
                      </h3>
                      <span className="text-[11px] text-zinc-500 block mt-1">
                        {formatArabicDateTime(rel.createdAt)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function ArticlePage({ params }) {
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
        <ArticleContent params={params} />
      </Suspense>

      <Suspense fallback={<div className="h-40 bg-zinc-900" />}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
