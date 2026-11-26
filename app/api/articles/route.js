import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ensureSeedData } from "@/lib/seed";
import { getAdminSession } from "@/lib/auth";
import Article from "@/models/Article";
import Category from "@/models/Category";

export async function GET(request) {
  try {
    await connectDB();
    await ensureSeedData();

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const q = searchParams.get("q")?.trim();
    const featured = searchParams.get("featured");
    const breaking = searchParams.get("breaking");
    const showAll = searchParams.get("all") === "true";
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const filter = {};

    if (showAll) {
      const session = await getAdminSession();
      if (!session) {
        filter.isPublished = true;
      }
    } else {
      filter.isPublished = true;
    }

    if (categoryParam) {
      const cat = await Category.findOne({
        $or: [
          { slug: decodeURIComponent(categoryParam) },
          ...(categoryParam.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: categoryParam }] : []),
        ],
      }).lean();

      if (cat) {
        filter.category = cat._id;
      } else {
        return NextResponse.json({ articles: [], total: 0 });
      }
    }

    if (featured === "true") filter.isFeatured = true;
    if (breaking === "true") filter.isBreaking = true;

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: regex }, { summary: regex }, { content: regex }];
    }

    const total = await Article.countDocuments(filter);
    const articles = await Article.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ articles, total, page, limit });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json({ error: "تعذر تحميل الأخبار" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const title = String(body.title || "").trim();
    const summary = String(body.summary || "").trim();
    const content = String(body.content || "").trim();
    const category = body.category;

    if (!title || !summary || !content || !category) {
      return NextResponse.json(
        { error: "العنوان والملخص والمحتوى والتصنيف حقول مطلوبة" },
        { status: 400 }
      );
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json({ error: "التصنيف المختار غير موجود" }, { status: 400 });
    }

    const photos = Array.isArray(body.photos)
      ? body.photos.map((p) => String(p).trim()).filter(Boolean)
      : [];

    const article = await Article.create({
      title,
      summary,
      content,
      category,
      author: String(body.author || "إدارة المدرسة").trim() || "إدارة المدرسة",
      photos,
      videoUrl: String(body.videoUrl || "").trim(),
      isFeatured: Boolean(body.isFeatured),
      isBreaking: Boolean(body.isBreaking),
      isPublished: body.isPublished !== false,
    });

    const populated = await Article.findById(article._id).populate("category", "name slug").lean();
    return NextResponse.json({ article: populated }, { status: 201 });
  } catch (error) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json({ error: "تعذر نشر الخبر" }, { status: 500 });
  }
}
