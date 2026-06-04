"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import {
  addMemberAction,
  removeMemberAction,
} from "@/features/review/presentation/admin-actions";

type MemberView = {
  id: string;
  role: "OWNER" | "MEMBER";
  email: string;
  name: string | null;
};

export function AdminClient({ members }: { members: MemberView[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await addMemberAction(formData);
      setMessage({
        text: result.success ? result.data! : result.error!,
        ok: result.success,
      });
      if (result.success) router.refresh();
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMemberAction(memberId);
      setMessage({
        text: result.success ? result.data! : result.error!,
        ok: result.success,
      });
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* メンバー一覧 */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          現在のメンバー
        </h2>
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {member.name ?? "(名前なし)"}
                </p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {member.role}
                </span>
                {member.role !== "OWNER" && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={isPending}
                    className="text-xs text-red-600 hover:text-red-800 disabled:opacity-40"
                  >
                    削除
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* メンバー追加フォーム */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          メンバーを追加
        </h2>
        <form action={handleAdd} className="flex gap-2">
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            追加
          </button>
        </form>
        {message && (
          <p
            className={`mt-2 text-sm ${message.ok ? "text-green-600" : "text-red-600"}`}
          >
            {message.text}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          ※ 追加する相手が先に一度ログインしている必要があります。
        </p>
      </section>
    </div>
  );
}
