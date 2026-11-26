import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminDashboardClient from "@/components/AdminDashboardClient";

async function AdminGate() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return <AdminDashboardClient username={session.username} />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-100 flex items-center justify-center text-sm text-zinc-600">
          جاري تحميل لوحة الإدارة...
        </div>
      }
    >
      <AdminGate />
    </Suspense>
  );
}
