import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ensureSeedData } from "@/lib/seed";
import Category from "@/models/Category";
import Article from "@/models/Article";

function serializeCategory(cat) {
  if (!cat) return null;
  return {
    _id: String(cat._id),
    name: cat.name,
    slug: cat.slug,
    order: cat.order ?? 0,
    showInNav: cat.showInNav !== false,
  };
}

function serializeArticle(doc) {
  if (!doc) return null;
  return {
    _id: String(doc._id),
    title: doc.title,
    summary: doc.summary,
    content: doc.content,
    category: doc.category
      ? {
          _id: String(doc.category._id),
          name: doc.category.name,
          slug: doc.category.slug,
        }
      : null,
    author: doc.author || "إدارة المدرسة",
    photos: Array.isArray(doc.photos) ? doc.photos : [],
    videoUrl: doc.videoUrl || "",
    isFeatured: Boolean(doc.isFeatured),
    isBreaking: Boolean(doc.isBreaking),
    isPublished: doc.isPublished !== false,
    views: doc.views || 0,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

export async function getNavCategories() {
  await connection();
  await connectDB();
  await ensureSeedData();
  const categories = await Category.find({ showInNav: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return categories.map(serializeCategory);
}

export async function getBreakingArticles() {
  await connection();
  await connectDB();
  await ensureSeedData();
  const articles = await Article.find({ isPublished: true, isBreaking: true })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  return articles.map(serializeArticle);
}

export async function getHomeData() {
  await connection();
  await connectDB();
  await ensureSeedData();

  const [categories, latestRaw, featuredRaw] = await Promise.all([
    Category.find({ showInNav: true }).sort({ order: 1, createdAt: 1 }).lean(),
    Article.find({ isPublished: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Article.find({ isPublished: true, isFeatured: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const serializedCategories = categories.map(serializeCategory);
  const latestArticles = latestRaw.map(serializeArticle);
  const featuredArticles = featuredRaw.map(serializeArticle);

  const categorySections = await Promise.all(
    serializedCategories.map(async (cat) => {
      const items = await Article.find({ isPublished: true, category: cat._id })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();
      return {
        category: cat,
        articles: items.map(serializeArticle),
      };
    })
  );

  return {
    categories: serializedCategories,
    latestArticles,
    featuredArticles,
    categorySections: categorySections.filter((s) => s.articles.length > 0),
  };
}

export async function getCategoryPageData(slugParam, page = 1, limit = 12) {
  await connection();
  await connectDB();
  await ensureSeedData();

  const decoded = decodeURIComponent(slugParam);
  const category = await Category.findOne({ slug: decoded }).lean();
  if (!category) return null;

  const filter = { isPublished: true, category: category._id };
  const total = await Article.countDocuments(filter);
  const articles = await Article.find(filter)
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    category: serializeCategory(category),
    articles: articles.map(serializeArticle),
    total,
    page,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

export async function getArticlePageData(id) {
  await connection();
  await connectDB();
  await ensureSeedData();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;

  const article = await Article.findOne({ _id: id, isPublished: true })
    .populate("category", "name slug")
    .lean();
  if (!article) return null;

  const related = await Article.find({
    isPublished: true,
    category: article.category?._id,
    _id: { $ne: article._id },
  })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    article: serializeArticle(article),
    relatedArticles: related.map(serializeArticle),
  };
}

export async function searchArticlesData(query) {
  await connection();
  await connectDB();
  await ensureSeedData();

  const q = String(query || "").trim();
  if (!q) return [];

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const articles = await Article.find({
    isPublished: true,
    $or: [{ title: regex }, { summary: regex }, { content: regex }],
  })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  return articles.map(serializeArticle);
}
