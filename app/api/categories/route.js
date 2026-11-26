import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ensureSeedData } from "@/lib/seed";
import { getAdminSession } from "@/lib/auth";
import { makeSlug } from "@/lib/helpers";
import Category from "@/models/Category";
import Article from "@/models/Article";

export async function GET() {
  try {
    await connectDB();
    await ensureSeedData();

    const categories = await Category.find().sort({ order: 1, createdAt: 1 }).lean();
    const counts = await Article.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

    const data = categories.map((cat) => ({
      ...cat,
      _id: String(cat._id),
      articleCount: countMap[String(cat._id)] || 0,
    }));

    return NextResponse.json({ categories: data });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "تعذر تحميل التصنيفات من قاعدة البيانات" },
      { status: 500 }
    );
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
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "اسم التصنيف مطلوب" }, { status: 400 });
    }

    let slug = makeSlug(body.slug || name);
    const existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const existingName = await Category.findOne({ name });
    if (existingName) {
      return NextResponse.json({ error: "يوجد تصنيف بهذا الاسم مسبقاً" }, { status: 409 });
    }

    const category = await Category.create({
      name,
      slug,
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
      showInNav: body.showInNav !== false,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "تعذر إنشاء التصنيف" }, { status: 500 });
  }
}
