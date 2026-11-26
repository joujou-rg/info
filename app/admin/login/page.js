"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل تسجيل الدخول");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 pb-4">
          <img
            src="/logo.png"
            alt="شعار المدرسة"
            className="w-11 h-11 object-contain shrink-0"
          />
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900">لوحة إدارة الأخبار</h1>
            <p className="text-xs text-zinc-500">تسجيل دخول المشرف</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-800 mb-1">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-[#fa9000]"
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-800 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-[#fa9000]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fa9000] hover:bg-[#d97706] disabled:opacity-60 text-white font-bold py-2.5 text-sm transition-colors"
          >
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-zinc-600 hover:text-[#d97706]">
            ← العودة إلى الصفحة الرئيسية للموقع
          </Link>
        </div>
      </div>
    </div>
  );
}
