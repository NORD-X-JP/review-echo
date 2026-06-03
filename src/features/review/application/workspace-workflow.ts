import type { User } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * ログイン中のユーザーの Prisma User レコードを作成または確認する。
 * （OrganizationMember の FK として必要）
 */
export async function ensureUserRecord(
  userId: string,
  clerkUser: User | null,
): Promise<void> {
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? `${userId}@clerk`;
  const name = clerkUser?.fullName ?? null;

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email, name },
    update: {},
  });
}

/**
 * ログイン中のユーザーが所属する組織IDを返す。
 * メンバーシップがない場合は null を返す（組織の自動作成は行わない）。
 */
export async function getOrganizationId(
  userId: string,
): Promise<string | null> {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { organizationId: true },
  });

  return membership?.organizationId ?? null;
}
