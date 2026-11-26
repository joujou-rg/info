"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Upload, LogOut, ExternalLink, X } from "lucide-react";

const EMPTY_ARTICLE_FORM = {
  _id: null,
  title: "",
  summary: "",
  content: "",
  category: "",
  author: "إدارة المدرسة",
  photos: [],
  videoUrl: "",
  isFeatured: false,
  isBreaking: false,
  isPublished: true,
};

export default function AdminDashboardClient({ username }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("articles");
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Article Form State
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [articleForm, setArticleForm] = useState(EMPTY_ARTICLE_FORM);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  // Category Form State
  const [catName, setCatName] = useState("");
  const [catOrder, setCatOrder] = useState(0);
  const [catShowInNav, setCatShowInNav] = useState(true);
  const [editingCatId, setEditingCatId] = useState(null);
  const [savingCat, setSavingCat] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [catRes, artRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/articles?all=true&limit=100"),
      ]);
      const catData = await catRes.json();
      const artData = await artRes.json();

      const loadedCats = catData.categories || [];
      setCategories(loadedCats);
      setArticles(artData.articles || []);

      if (loadedCats.length > 0 && !articleForm.category) {
        setArticleForm((prev) => ({ ...prev, category: loadedCats[0]._id }));
      }
    } catch {
      setStatusMsg({ type: "error", text: "تعذر تحميل البيانات من الخادم" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleFileUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setStatusMsg({ type: "error", text: data.error || "فشل رفع الصور" });
        return;
      }

      setArticleForm((prev) => ({
        ...prev,
        photos: [...prev.photos, ...(data.urls || [])],
      }));
    } catch {
      setStatusMsg({ type: "error", text: "حدث خطأ أثناء رفع الصور" });
    } finally {
      setUploadingPhotos(false);
      e.target.value = "";
    }
  }

  function handleAddPhotoUrl() {
    const url = photoUrlInput.trim();
    if (!url) return;
    setArticleForm((prev) => ({ ...prev, photos: [...prev.photos, url] }));
    setPhotoUrlInput("");
  }

  function handleRemovePhoto(index) {
    setArticleForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  }

  function openNewArticleForm() {
    setArticleForm({
      ...EMPTY_ARTICLE_FORM,
      category: categories[0]?._id || "",
    });
    setShowArticleForm(true);
    setStatusMsg({ type: "", text: "" });
  }

  function openEditArticleForm(article) {
    setArticleForm({
      _id: article._id,
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category?._id || categories[0]?._id || "",
      author: article.author || "إدارة المدرسة",
      photos: article.photos || [],
      videoUrl: article.videoUrl || "",
      isFeatured: Boolean(article.isFeatured),
      isBreaking: Boolean(article.isBreaking),
      isPublished: article.isPublished !== false,
    });
    setShowArticleForm(true);
    setStatusMsg({ type: "", text: "" });
  }

  async function handleSaveArticle(e) {
    e.preventDefault();
    setSavingArticle(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const isEdit = Boolean(articleForm._id);
      const url = isEdit ? `/api/articles/${articleForm._id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({ type: "error", text: data.error || "تعذر حفظ الخبر" });
        return;
      }

      setStatusMsg({
        type: "success",
        text: isEdit ? "تم تحديث الخبر بنجاح" : "تم نشر الخبر بنجاح",
      });
      setShowArticleForm(false);
      await loadData();
    } catch {
      setStatusMsg({ type: "error", text: "حدث خطأ في الاتصال بالخادم" });
    } finally {
      setSavingArticle(false);
    }
  }

  async function handleDeleteArticle(id) {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;

    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStatusMsg({ type: "success", text: "تم حذف الخبر بنجاح" });
      await loadData();
    } else {
      const data = await res.json();
      setStatusMsg({ type: "error", text: data.error || "تعذر حذف الخبر" });
    }
  }

  async function handleSaveCategory(e) {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCat(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const isEdit = Boolean(editingCatId);
      const url = isEdit ? `/api/categories/${editingCatId}` : "/api/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName.trim(),
          order: Number(catOrder) || 0,
          showInNav: catShowInNav,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMsg({ type: "error", text: data.error || "تعذر حفظ التصنيف" });
        return;
      }

      setCatName("");
      setCatOrder(0);
      setCatShowInNav(true);
      setEditingCatId(null);
      setStatusMsg({
        type: "success",
        text: isEdit ? "تم تحديث التصنيف بنجاح" : "تم إضافة التصنيف بنجاح",
      });
      await loadData();
    } catch {
      setStatusMsg({ type: "error", text: "حدث خطأ أثناء حفظ التصنيف" });
    } finally {
      setSavingCat(false);
    }
  }

  function startEditCategory(cat) {
    setEditingCatId(cat._id);
    setCatName(cat.name);
    setCatOrder(cat.order || 0);
    setCatShowInNav(cat.showInNav !== false);
    setStatusMsg({ type: "", text: "" });
  }

  async function handleDeleteCategory(id) {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;

    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setStatusMsg({ type: "success", text: "تم حذف التصنيف بنجاح" });
      await loadData();
    } else {
      setStatusMsg({ type: "error", text: data.error || "تعذر حذف التصنيف" });
    }
  }

  const filteredArticles = filterCategory
    ? articles.filter((a) => a.category?._id === filterCategory)
    : articles;

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-zinc-900 text-white border-b-4 border-[#fa9000]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="شعار المدرسة"
              className="w-9 h-9 object-contain shrink-0 bg-white p-0.5"
            />
            <div>
              <div className="font-extrabold text-base">لوحة إدارة بوابة الأخبار</div>
              <div className="text-xs text-zinc-400">مرحباً، {username}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-zinc-300 hover:text-[#fa9000]"
            >
              <ExternalLink className="w-4 h-4" />
              <span>عرض الموقع</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-red-600 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        {/* Status Message */}
        {statusMsg.text && (
          <div
            className={`px-4 py-3 border text-sm font-medium ${statusMsg.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-300 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("articles")}
            className={`px-6 py-3.5 text-sm font-extrabold border-b-2 transition-colors ${activeTab === "articles"
                ? "border-[#fa9000] text-[#d97706] bg-zinc-50"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
              }`}
          >
            إدارة الأخبار ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-3.5 text-sm font-extrabold border-b-2 transition-colors ${activeTab === "categories"
                ? "border-[#fa9000] text-[#d97706] bg-zinc-50"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
              }`}
          >
            إدارة التصنيفات ({categories.length})
          </button>
        </div>

        {/* TAB 1: ARTICLES */}
        {activeTab === "articles" && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-zinc-200 p-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-zinc-700">تصفية حسب التصنيف:</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-zinc-300 px-3 py-2 text-sm bg-white outline-none focus:border-[#fa9000]"
                >
                  <option value="">جميع التصنيفات</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={openNewArticleForm}
                className="flex items-center gap-2 bg-[#fa9000] hover:bg-[#d97706] text-white font-bold px-4 py-2.5 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>نشر خبر جديد</span>
              </button>
            </div>

            {/* Article Create/Edit Form */}
            {showArticleForm && (
              <form
                onSubmit={handleSaveArticle}
                className="bg-white border border-zinc-300 p-6 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <h2 className="text-lg font-extrabold text-zinc-900">
                    {articleForm._id ? "تعديل الخبر" : "نشر خبر جديد"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowArticleForm(false)}
                    className="text-zinc-500 hover:text-zinc-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-800 mb-1">
                      عنوان الخبر *
                    </label>
                    <input
                      type="text"
                      required
                      value={articleForm.title}
                      onChange={(e) =>
                        setArticleForm({ ...articleForm, title: e.target.value })
                      }
                      className="w-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#fa9000]"
                      placeholder="أدخل عنوان الخبر..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-800 mb-1">
                      التصنيف *
                    </label>
                    <select
                      required
                      value={articleForm.category}
                      onChange={(e) =>
                        setArticleForm({ ...articleForm, category: e.target.value })
                      }
                      className="w-full border border-zinc-300 px-3 py-2 text-sm bg-white outline-none focus:border-[#fa9000]"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-800 mb-1">
                      المصدر
                    </label>
                    <input
                      type="text"
                      value={articleForm.author}
                      onChange={(e) =>
                        setArticleForm({ ...articleForm, author: e.target.value })
                      }
                      className="w-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#fa9000]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-800 mb-1">
                      الوصف المختصر (يظهر في البطاقات) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={articleForm.summary}
                      onChange={(e) =>
                        setArticleForm({ ...articleForm, summary: e.target.value })
                      }
                      className="w-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#fa9000]"
                      placeholder="ملخص سريع للخبر..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-800 mb-1">
                      نص الخبر الكامل *
                    </label>
                    <textarea
                      rows={7}
                      required
                      value={articleForm.content}
                      onChange={(e) =>
                        setArticleForm({ ...articleForm, content: e.target.value })
                      }
                      className="w-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#fa9000]"
                      placeholder="اكتب تفاصيل الخبر هنا..."
                    />
                  </div>

                  {/* Photos Upload & URLs */}
                  <div className="md:col-span-2 border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                    <label className="block text-sm font-bold text-zinc-800">
                      صور الخبر (يمكنك رفع صورة واحدة أو عدة صور)
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2.5">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingPhotos ? "جاري الرفع..." : "رفع صور من الجهاز"}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadingPhotos}
                        />
                      </label>

                      <div className="flex flex-1 min-w-[240px] gap-2">
                        <input
                          type="text"
                          value={photoUrlInput}
                          onChange={(e) => setPhotoUrlInput(e.target.value)}
                          placeholder="أو الصق رابط صورة (URL)..."
                          className="flex-1 border border-zinc-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#fa9000]"
                        />
                        <button
                          type="button"
                          onClick={handleAddPhotoUrl}
                          className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900 text-xs font-bold px-3 py-2"
                        >
                          إضافة رابط
                        </button>
                      </div>
                    </div>

                    {articleForm.photos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {articleForm.photos.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative border border-zinc-300 bg-white p-1"
                          >
                            <img
                              src={url}
                              alt={`صورة ${idx + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-2 right-2 bg-[#fa9000] text-white text-[10px] font-bold px-1.5 py-0.5">
                                الرئيسية
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-2 left-2 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs font-bold"
                              title="حذف الصورة"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-800 mb-1">
                      رابط فيسبوك (اختياري)
                    </label>
                    <input
                      type="url"
                      value={articleForm.videoUrl}
                      onChange={(e) =>
                        setArticleForm({ ...articleForm, videoUrl: e.target.value })
                      }
                      className="w-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#fa9000]"
                      placeholder="https://web.facebook.com/..."
                      dir="ltr"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={articleForm.isFeatured}
                        onChange={(e) =>
                          setArticleForm({ ...articleForm, isFeatured: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#fa9000]"
                      />
                      خبر رئيسي (يظهر في الواجهة)
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={articleForm.isBreaking}
                        onChange={(e) =>
                          setArticleForm({ ...articleForm, isBreaking: e.target.checked })
                        }
                        className="w-4 h-4 accent-red-600"
                      />
                      خبر عاجل (شريط الأخبار)
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={articleForm.isPublished}
                        onChange={(e) =>
                          setArticleForm({ ...articleForm, isPublished: e.target.checked })
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                      منشور (مرئي للزوار)
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
                  <button
                    type="submit"
                    disabled={savingArticle}
                    className="bg-[#fa9000] hover:bg-[#d97706] disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm"
                  >
                    {savingArticle
                      ? "جاري الحفظ..."
                      : articleForm._id
                        ? "حفظ التعديلات"
                        : "نشر الخبر"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowArticleForm(false)}
                    className="border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-bold px-5 py-2.5 text-sm"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            {/* Articles Table */}
            <div className="bg-white border border-zinc-200 overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700">
                  <tr>
                    <th className="py-3 px-4 font-bold">العنوان</th>
                    <th className="py-3 px-4 font-bold">التصنيف</th>
                    <th className="py-3 px-4 font-bold">الحالة</th>
                    <th className="py-3 px-4 font-bold">الصور</th>
                    <th className="py-3 px-4 font-bold">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">
                        جاري التحميل...
                      </td>
                    </tr>
                  ) : filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">
                        لا توجد أخبار حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((art) => (
                      <tr key={art._id} className="hover:bg-zinc-50">
                        <td className="py-3 px-4 font-bold text-zinc-900 max-w-md">
                          <Link
                            href={`/news/${art._id}`}
                            target="_blank"
                            className="hover:text-[#d97706]"
                          >
                            {art.title}
                          </Link>
                          <div className="flex gap-2 mt-1">
                            {art.isFeatured && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 font-bold">
                                رئيسي
                              </span>
                            )}
                            {art.isBreaking && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 font-bold">
                                عاجل
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-700">
                          {art.category?.name || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 ${art.isPublished
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-zinc-200 text-zinc-700"
                              }`}
                          >
                            {art.isPublished ? "منشور" : "مسودة"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          {art.photos?.length || 0}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditArticleForm(art)}
                              className="p-1.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                              title="تعديل"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art._id)}
                              className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === "categories" && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Add / Edit Category Form */}
            <form
              onSubmit={handleSaveCategory}
              className="lg:col-span-4 bg-white border border-zinc-200 p-5 space-y-4 h-fit"
            >
              <h2 className="text-lg font-extrabold text-zinc-900 border-b border-zinc-200 pb-2">
                {editingCatId ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
              </h2>

              <div>
                <label className="block text-sm font-bold text-zinc-800 mb-1">
                  اسم التصنيف *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="مثال: أخبار المنسقين"
                  className="w-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#fa9000]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-800 mb-1">
                  الترتيب في القائمة
                </label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(e.target.value)}
                  className="w-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#fa9000]"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catShowInNav}
                  onChange={(e) => setCatShowInNav(e.target.checked)}
                  className="w-4 h-4 accent-[#fa9000]"
                />
                إظهار في الشريط العلوي للموقع
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingCat}
                  className="flex-1 bg-[#fa9000] hover:bg-[#d97706] text-white font-bold py-2.5 text-sm"
                >
                  {savingCat
                    ? "جاري الحفظ..."
                    : editingCatId
                      ? "حفظ التعديل"
                      : "إضافة التصنيف"}
                </button>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(null);
                      setCatName("");
                      setCatOrder(0);
                      setCatShowInNav(true);
                    }}
                    className="border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-700"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>

            {/* Categories Table */}
            <div className="lg:col-span-8 bg-white border border-zinc-200 overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700">
                  <tr>
                    <th className="py-3 px-4 font-bold">الاسم</th>
                    <th className="py-3 px-4 font-bold">الترتيب</th>
                    <th className="py-3 px-4 font-bold">في القائمة</th>
                    <th className="py-3 px-4 font-bold">عدد الأخبار</th>
                    <th className="py-3 px-4 font-bold">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-zinc-50">
                      <td className="py-3 px-4 font-bold text-zinc-900">{cat.name}</td>
                      <td className="py-3 px-4 text-zinc-600">{cat.order}</td>
                      <td className="py-3 px-4">
                        {cat.showInNav ? "نعم" : "لا"}
                      </td>
                      <td className="py-3 px-4 text-zinc-700">{cat.articleCount || 0}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditCategory(cat)}
                            className="p-1.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                            title="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
