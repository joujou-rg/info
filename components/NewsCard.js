import Link from "next/link";
import { formatArabicDate } from "@/lib/helpers";

export default function NewsCard({ article, compact = false }) {
  const coverImage = article.photos?.[0] || "/images/samples/news-1.svg";

  return (
    <article className="bg-white border border-zinc-200 flex flex-col group hover:border-zinc-400 transition-colors">
      <Link href={`/news/${article._id}`} className="block overflow-hidden bg-zinc-100">
        <img
          src={coverImage}
          alt={article.title}
          className={`w-full object-cover group-hover:scale-[1.02] transition-transform duration-300 ${
            compact ? "h-40" : "h-48"
          }`}
        />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          {article.category && (
            <Link
              href={`/category/${encodeURIComponent(article.category.slug)}`}
              className="text-xs font-bold text-[#d97706] hover:underline"
            >
              {article.category.name}
            </Link>
          )}
          <span className="text-[11px] text-zinc-500">
            {formatArabicDate(article.createdAt)}
          </span>
        </div>

        <h3 className="font-bold text-zinc-900 leading-snug mb-2 group-hover:text-[#d97706] transition-colors line-clamp-2">
          <Link href={`/news/${article._id}`}>{article.title}</Link>
        </h3>

        {!compact && (
          <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3 mt-auto">
            {article.summary}
          </p>
        )}
      </div>
    </article>
  );
}
