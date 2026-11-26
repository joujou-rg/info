import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import Article from "@/models/Article";
import Category from "@/models/Category";

export async function GET(_request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const article = await Article.findById(id).populate("category", "name slug").lean();
    if (!article) {
      return NextResponse.json({ error: "الخبر غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("GET /api/articles/[id] error:", error);
    return NextResponse.json({ error: "تعذر تحميل الخبر" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const existing = await Article.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "الخبر غير موجود" }, { status: 404 });
    }

    if (body.category) {
      const catExists = await Category.findById(body.category);
      if (!catExists) {
        return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 400 });
      }
      existing.category = body.category;
    }

    if (body.title !== undefined) existing.title = String(body.title).trim();
    if (body.summary !== undefined) existing.summary = String(body.summary).trim();
    if (body.content !== undefined) existing.content = String(body.content).trim();
    if (body.author !== undefined) existing.author = String(body.author).trim() || "إدارة المدرسة";
    if (Array.isArray(body.photos)) {
      existing.photos = body.photos.map((p) => String(p).trim()).filter(Boolean);
    }
    if (body.videoUrl !== undefined) existing.videoUrl = String(body.videoUrl).trim();
    if (body.isFeatured !== undefined) existing.isFeatured = Boolean(body.isFeatured);
    if (body.isBreaking !== undefined) existing.isBreaking = Boolean(body.isBreaking);
    if (body.isPublished !== undefined) existing.isPublished = Boolean(body.isPublished);

    await existing.save();
    const populated = await Article.findById(existing._id).populate("category", "name slug").lean();
    return NextResponse.json({ article: populated });
  } catch (error) {
    console.error("PUT /api/articles/[id] error:", error);
    return NextResponse.json({ error: "تعذر تحديث الخبر" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const deleted = await Article.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "الخبر غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/articles/[id] error:", error);
    return NextResponse.json({ error: "تعذر حذف الخبر" }, { status: 500 });
  }
}
