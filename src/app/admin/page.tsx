import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrganizationId } from "@/features/review/application/workspace-workflow";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const organizationId = await getOrganizationId(userId);
  if (!organizationId) redirect("/dashboard");

  // OWNER 以外はダッシュボードへ
  const myMembership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId },
    select: { role: true },
  });
  if (myMembership?.role !== "OWNER") redirect("/dashboard");

  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const memberViews = members.map((m) => ({
    id: m.id,
    role: m.role as "OWNER" | "MEMBER",
    email: m.user.email,
    name: m.user.name,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">メンバー管理</h1>
          <p className="text-gray-500 mt-1 text-sm">
            組織のメンバーを追加・削除できます。
          </p>
        </header>
        <AdminClient members={memberViews} />
      </div>
    </div>
  );
}
