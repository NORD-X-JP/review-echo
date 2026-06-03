"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/result";
import { getOrganizationId } from "../application/workspace-workflow";

async function requireOwnerContext() {
  const { userId } = await auth();
  if (!userId) return null;

  const organizationId = await getOrganizationId(userId);
  if (!organizationId) return null;

  const membership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId },
    select: { role: true },
  });
  if (membership?.role !== "OWNER") return null;

  return { userId, organizationId };
}

export async function addMemberAction(
  formData: FormData,
): Promise<Result<string>> {
  const context = await requireOwnerContext();
  if (!context) return { success: false, error: "権限がありません。" };

  const email = (formData.get("email") as string)?.trim();
  if (!email)
    return { success: false, error: "メールアドレスを入力してください。" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      success: false,
      error:
        "このメールアドレスのユーザーが見つかりません。先にログインしてもらってください。",
    };
  }

  const existing = await prisma.organizationMember.findFirst({
    where: { organizationId: context.organizationId, userId: user.id },
  });
  if (existing)
    return { success: false, error: "すでにメンバーとして登録されています。" };

  await prisma.organizationMember.create({
    data: {
      organizationId: context.organizationId,
      userId: user.id,
      role: "MEMBER",
    },
  });

  return { success: true, data: `${email} をメンバーに追加しました。` };
}

export async function removeMemberAction(
  memberId: string,
): Promise<Result<string>> {
  const context = await requireOwnerContext();
  if (!context) return { success: false, error: "権限がありません。" };

  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });
  if (!member || member.organizationId !== context.organizationId) {
    return { success: false, error: "対象のメンバーが見つかりません。" };
  }
  if (member.role === "OWNER") {
    return { success: false, error: "オーナーは削除できません。" };
  }

  await prisma.organizationMember.delete({ where: { id: memberId } });

  return { success: true, data: "メンバーを削除しました。" };
}
