import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import { makeSlug } from "@/lib/helpers";
import Category from "@/models/Category";
import Article from "@/models/Article";

export async function PUT(request, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "اسم التصنيف مطلوب" }, { status: 400 });
    }

    const existing = await Category.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 404 });
    }

    let slug = makeSlug(body.slug || name);
    const duplicateSlug = await Category.findOne({ slug, _id: { $ne: id } });
    if (duplicateSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    existing.name = name;
    existing.slug = slug;
    if (body.order !== undefined) existing.order = Number(body.order) || 0;
    if (body.showInNav !== undefined) existing.showInNav = Boolean(body.showInNav);

    await existing.save();
    return NextResponse.json({ category: existing });
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json({ error: "تعذر تحديث التصنيف" }, { status: 500 });
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

    const linkedCount = await Article.countDocuments({ category: id });
    if (linkedCount > 0) {
      return NextResponse.json(
        {
          error: `لا يمكن حذف هذا التصنيف لأنه مرتبط بـ ${linkedCount} منشورات. قم بنقل المنشورات أو حذفها أولاً.`,
        },
        { status: 400 }
      );
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json({ error: "تعذر حذف التصنيف" }, { status: 500 });
  }
}
